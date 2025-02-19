import { HttpService } from '@nestjs/axios'
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { AxiosResponse } from 'axios'
import { of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

interface ProxyRequest {
  method: 'GET' | 'POST'
  url: string
  type: 'query' | 'body'
  data: Record<string, any>
}

@Controller('api/v2/proxy')
export class ProxyController {
  private readonly allowedDomains = [
    'https://v-archive.net',
    'https://hard-archive.com',
  ]

  constructor(private readonly httpService: HttpService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleProxyRequest(@Body() proxyRequest: ProxyRequest) {
    try {
      const { method, url, type, data } = proxyRequest

      // URL 유효성 검사
      const parsedUrl = new URL(url)
      if (!this.allowedDomains.includes(parsedUrl.origin)) {
        return {
          statusCode: HttpStatus.FORBIDDEN,
          error: '허용되지 않은 도메인입니다',
          allowedDomains: this.allowedDomains,
        }
      }

      // 요청 설정
      let finalUrl = url
      let requestBody = undefined

      if (type === 'query') {
        const params = new URLSearchParams(data)
        finalUrl = `${url}${url.includes('?') ? '&' : '?'}${params.toString()}`
      } else {
        requestBody = data
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          // 원본 요청의 인증 헤더 유지
          ...(data.headers || {}),
        },
      }

      // 요청 실행
      const request$ =
        method === 'GET'
          ? this.httpService.get(finalUrl, config)
          : this.httpService.post(finalUrl, requestBody, config)

      return request$.pipe(
        map((response: AxiosResponse) => ({
          statusCode: response.status,
          data: response.data,
        })),
        catchError((error) =>
          of({
            statusCode:
              error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            error: error.message,
            data: error.response?.data,
          }),
        ),
      )
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        error: '잘못된 요청입니다',
        message: error.message,
      }
    }
  }
}
