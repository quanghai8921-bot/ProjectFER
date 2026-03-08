import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { messages, menuContext } = await req.json()
        // @ts-ignore
        const apiKey = Deno.env.get('GEMINI_API_KEY')

        if (!apiKey) {
            throw new Error('GEMINI_API_KEY chưa được thiết lập')
        }

        // Sử dụng model alias 'gemini-flash-latest' vì gemini-1.5-flash không có trong danh sách của bạn
        // Thử với endpoint v1beta cho độ tương thích cao nhất với các model mới
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`

        const lastMessage = messages[messages.length - 1]?.content || ""
        const history = (messages || []).slice(0, -1).map((m: any) =>
            `${m.role === 'user' ? 'Người dùng' : 'AI'}: ${m.content}`
        ).join('\n')

        const prompt = `Bạn là một AI Advisor chuyên nghiệp cho ứng dụng SmartBite G5. 
Tư vấn dựa trên thực đơn này:
${menuContext}

Lịch sử: ${history}
Câu hỏi mới: ${lastMessage}

Lời khuyên bằng tiếng Việt, thân thiện, ngắn gọn.`

        const googleResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        })

        const data = await googleResponse.json()

        if (data.error) {
            throw new Error(data.error.message)
        }

        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Xin lỗi, tôi không thể trả lời lúc này."

        return new Response(
            JSON.stringify({ content: aiText }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
