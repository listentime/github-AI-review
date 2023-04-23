import createRequest from "../utils/request";
import type { AxiosInstance } from "axios";
import { ChatGPTConfig } from "../types/types";
import { logger } from "../utils/utils";

export default class ChatGPT {

  private language: string; // 指定回答语言类型
  private request: AxiosInstance; // 请求实例

  constructor(config: ChatGPTConfig) {
    // 请求地址
    const host = 'https://api.openai.com'
    // 创建请求实例
    this.request = createRequest(host, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`
      },
      // ⚠️ 稍后完善参数意义注释
      data: {
        model: config.model || 'gpt-3.5-turbo',
        temperature: +(config.temperature || 0) || 1,
        top_p: +(config.top_p || 0) || 1,
        presence_penalty: 1,
        stream: false,
        max_token: 1000,
      }
    })
    this.language = config.language || 'Chinese'
  }

  // 生成提问模板
  private generatePrompt = async (codePatch:string)=>{
    return `below is the github code patch,please help me do a brief review,answer me in ${this.language} if any bug risk or improvement suggestion are welcome。
    ${codePatch}`;
  }

  private sendMessage = (prompt:string)=>{
    const currentDate = new Date().toISOString().split('T')[0]
    return this.request.post('/v1/chat/completions',{
      messages: [
        {
          role: 'system',
          content:
            'You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible.\n' +
            'Knowledge cutoff: 2021-09-01\n' +
            `Current date: ${currentDate}`,
        },
        { role: 'user', content: prompt, name: undefined },
      ],
    })
  }

  public codeReview = async (codePatch:string)=>{
    if(!codePatch){
      logger.error('代码块为空')
      return ''
    }
    const prompt = this.generatePrompt(codePatch)
    const res = await this.sendMessage(codePatch)
    console.log(res,'请求结果')
    const {choices} = res.data
    if(Array.isArray(choices) && choices.length > 0){
      return choices[0]?.message?.content
    }
    return ''
  }
}