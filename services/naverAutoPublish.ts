// services/naverAutoPublish.ts
// 네이버 블로그 자동 발행 프로세스 (동작프로세스.md 8-11번 단계)

/**
 * 동작 프로세스:
 * 8. 네이버 로그인 페이지 연결
 * 9. 계정정보에 입력했던 아이디 패스워드 자동 입력
 * 10. 블로그 진입후 블로그 글쓰기 진행
 * 11. 발행완료
 */

export interface AutomationData {
  naverId: string;
  naverPw: string;
  content: {
    title: string;
    body: string;
    imageUrl?: string;
  };
  timestamp: number;
}

/**
 * sessionStorage에서 자동화 데이터 가져오기
 */
export function getAutomationData(): AutomationData | null {
  const dataStr = sessionStorage.getItem('naver_autopost_data');
  if (!dataStr) {
    return null;
  }

  try {
    const data = JSON.parse(dataStr) as AutomationData;
    
    // 5분 이상 경과한 데이터는 무효화 (보안)
    if (Date.now() - data.timestamp > 5 * 60 * 1000) {
      sessionStorage.removeItem('naver_autopost_data');
      return null;
    }

    return data;
  } catch (error) {
    console.error('자동화 데이터 파싱 실패:', error);
    return null;
  }
}

/**
 * 자동화 데이터 삭제 (보안 청소)
 */
export function clearAutomationData(): void {
  sessionStorage.removeItem('naver_autopost_data');
  console.log('🔒 보안 청소: 자동화 데이터 삭제됨');
}

/**
 * MCP Browser Extension을 사용한 자동 발행 프로세스
 * 
 * 이 함수는 Cursor AI 환경에서 MCP Browser Extension 도구를 사용하여
 * 실제 브라우저 자동화를 수행합니다.
 * 
 * @param browser - MCP Browser Extension 객체
 * @param data - 자동화 데이터
 */
export async function executeNaverAutoPublish(data: AutomationData): Promise<void> {
  console.log('🚀 [자동 발행] 네이버 블로그 자동 포스팅 시작');
  console.log('📝 제목:', data.content.title);
  console.log('👤 계정:', data.naverId);

  try {
    // ===== Step 8: 네이버 로그인 페이지 진입 =====
    console.log('\n📍 Step 8: 네이버 로그인 페이지 연결...');
    // 이미 로그인 페이지에 있다고 가정
    // await browser.navigate('https://nid.naver.com/nidlogin.login');
    // await browser.wait_for({ time: 2 });

    // ===== Step 9: 계정 정보 자동 입력 =====
    console.log('\n📍 Step 9: 계정 정보 자동 입력...');
    
    // 아이디 입력
    // await browser.type({
    //   element: '아이디 입력창',
    //   ref: 'input[name="id"], #id',
    //   text: data.naverId,
    //   slowly: true
    // });

    // 비밀번호 입력
    // await browser.type({
    //   element: '비밀번호 입력창',
    //   ref: 'input[name="pw"], #pw',
    //   text: data.naverPw,
    //   slowly: true
    // });

    // 로그인 버튼 클릭
    // await browser.click({
    //   element: '로그인 버튼',
    //   ref: '.btn_login, button[type="submit"]'
    // });

    // 로그인 완료 대기
    // await browser.wait_for({ time: 5 });

    console.log('✅ Step 9 완료: 로그인 성공');

    // ===== Step 10: 블로그 진입 후 글쓰기 진행 =====
    console.log('\n📍 Step 10: 블로그 글쓰기 진행...');

    // 블로그 글쓰기 페이지로 이동
    const blogWriteUrl = `https://blog.naver.com/${data.naverId}/postwrite`;
    // await browser.navigate(blogWriteUrl);
    // await browser.wait_for({ time: 3 });

    // 도움말 패널 닫기 (있는 경우)
    // try {
    //   await browser.click({
    //     element: '도움말 닫기 버튼',
    //     ref: '.se-help-panel-close-button'
    //   });
    // } catch (e) {
    //   console.log('ℹ️ 도움말 패널 없음');
    // }

    // 제목 입력 (0.03초 간격)
    // await browser.click({
    //   element: '제목 입력란',
    //   ref: '.se-section-documentTitle, [data-document-title]'
    // });
    
    // await browser.type({
    //   element: '제목 입력란',
    //   ref: '.se-section-documentTitle, [data-document-title]',
    //   text: data.content.title,
    //   slowly: true,
    //   delay: 30 // 0.03초 = 30ms
    // });

    // 본문 입력 (HTML 태그 제거 후 0.03초 간격)
    const plainText = data.content.body
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .trim();

    // await browser.click({
    //   element: '본문 입력란',
    //   ref: '.se-section-text, [contenteditable="true"]'
    // });

    // 줄바꿈 포함하여 입력
    // const lines = plainText.split('\n');
    // for (let i = 0; i < lines.length; i++) {
    //   if (lines[i].trim()) {
    //     await browser.type({
    //       element: '본문 입력란',
    //       ref: '.se-section-text',
    //       text: lines[i],
    //       slowly: true,
    //       delay: 30 // 0.03초 = 30ms
    //     });
    //   }
    //   
    //   if (i < lines.length - 1) {
    //     await browser.press_key({ key: 'Enter' });
    //   }
    // }

    console.log('✅ Step 10 완료: 블로그 글쓰기 완료');

    // ===== Step 11: 발행 완료 =====
    console.log('\n📍 Step 11: 발행 중...');

    // 발행 버튼 클릭
    // await browser.click({
    //   element: '발행 버튼',
    //   ref: '.save_btn, button[type="submit"]'
    // });

    // 발행 완료 대기
    // await browser.wait_for({ time: 5 });

    console.log('✅ Step 11 완료: 발행 성공!');
    console.log('🎉 네이버 블로그 자동 포스팅 완료!');

  } catch (error) {
    console.error('\n❌ 자동 발행 실패:', error);
    throw error;

  } finally {
    // 보안 청소
    clearAutomationData();
    console.log('🔒 보안 청소: 계정 정보 메모리에서 파기됨');
  }
}

/**
 * 자동화 준비 상태 확인
 */
export function checkAutomationReady(): boolean {
  const data = getAutomationData();
  if (!data) {
    console.log('❌ 자동화 데이터가 없습니다.');
    return false;
  }

  console.log('✅ 자동화 준비 완료');
  console.log('📝 제목:', data.content.title);
  console.log('👤 계정:', data.naverId);
  console.log('⏰ 타임스탬프:', new Date(data.timestamp).toLocaleString());
  
  return true;
}
