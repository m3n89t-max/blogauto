// Gemini API 연결 테스트 스크립트
// Node.js에서 실행: node test-gemini-api.js

const apiKey = process.env.VITE_GEMINI_API_KEY || 'YOUR_API_KEY_HERE';

console.log('🔍 Gemini API 연결 테스트 시작...\n');
console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}\n`);

const testGeminiAPI = async () => {
  const model = 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  console.log(`📍 모델: ${model}`);
  console.log(`📍 URL: ${url.replace(apiKey, '***API_KEY***')}\n`);

  const requestBody = {
    contents: [{
      parts: [{ text: '안녕하세요. 간단한 테스트 메시지입니다. "테스트 성공"이라고 답변해주세요.' }]
    }]
  };

  try {
    console.log('📤 API 요청 전송 중...\n');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log(`📊 HTTP 상태 코드: ${response.status} ${response.statusText}\n`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API 호출 실패!\n');
      console.error(`상세 에러:\n${errorText}\n`);
      
      try {
        const errorJson = JSON.parse(errorText);
        console.error(`파싱된 에러:\n${JSON.stringify(errorJson, null, 2)}\n`);
      } catch (e) {
        // 파싱 실패는 무시
      }
      
      return;
    }

    const data = await response.json();
    console.log('✅ API 호출 성공!\n');
    console.log(`응답 데이터:\n${JSON.stringify(data, null, 2)}\n`);
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const responseText = data.candidates[0].content.parts[0].text;
      console.log(`🤖 AI 응답: ${responseText}\n`);
    }
    
    console.log('🎉 Gemini API 연결 테스트 성공! 앱에서도 정상 작동할 것입니다.\n');
    
  } catch (error) {
    console.error('❌ 네트워크 오류 또는 예외 발생!\n');
    console.error(`에러 메시지: ${error.message}\n`);
    console.error(`상세:\n${error.stack}\n`);
  }
};

// API 키 확인
if (!apiKey || apiKey === 'YOUR_API_KEY_HERE' || apiKey.includes('undefined')) {
  console.error('❌ API 키가 설정되지 않았습니다!\n');
  console.error('.env.local 파일을 생성하고 다음 내용을 추가하세요:\n');
  console.error('VITE_GEMINI_API_KEY=실제발급받은키\n');
  console.error('그 다음 다시 실행하세요: node test-gemini-api.js\n');
  process.exit(1);
}

testGeminiAPI();
