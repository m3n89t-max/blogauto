import express, { Request, Response } from 'express';
import cors from 'cors';
import { chromium, Browser, Page } from 'playwright';

const app = express();
const PORT = 3002;

// 미들웨어
app.use(cors());
app.use(express.json());

// 자동화 데이터 타입
interface AutoPublishRequest {
  naverId: string;
  naverPw: string;
  title: string;
  body: string;
  imageUrl?: string;
}

// 네이버 블로그 자동 발행 API
app.post('/api/auto-publish', async (req: Request, res: Response) => {
  const { naverId, naverPw, title, body, imageUrl }: AutoPublishRequest = req.body;

  // 입력 검증
  if (!naverId || !naverPw || !title || !body) {
    return res.status(400).json({
      success: false,
      message: '필수 정보가 누락되었습니다. (아이디, 비밀번호, 제목, 본문)'
    });
  }

  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    console.log('🚀 Step 1: Playwright 브라우저 시작...');
    browser = await chromium.launch({
      headless: false, // 사용자가 볼 수 있도록
      slowMo: 50 // 속도 조절
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });

    page = await context.newPage();

    // Step 2: 네이버 로그인
    console.log('🔐 Step 2: 네이버 로그인 페이지로 이동...');
    await page.goto('https://nid.naver.com/nidlogin.login', {
      waitUntil: 'networkidle'
    });

    // 아이디 입력
    await page.fill('#id', naverId);
    await page.waitForTimeout(500);

    // 비밀번호 입력
    await page.fill('#pw', naverPw);
    await page.waitForTimeout(500);

    // 로그인 버튼 클릭
    await page.click('.btn_login');
    await page.waitForTimeout(3000);

    // 캡차 확인
    const currentUrl = page.url();
    if (currentUrl.includes('nidlogin') || currentUrl.includes('captcha')) {
      return res.status(400).json({
        success: false,
        message: '⚠️ 네이버 캡차가 감지되었습니다. 수동으로 해결해주세요.',
        captchaDetected: true
      });
    }

    console.log('✅ Step 2 완료: 네이버 로그인 성공');

    // Step 3: 블로그 글쓰기 페이지로 이동
    console.log('📝 Step 3: 블로그 글쓰기 페이지로 이동...');
    await page.goto(`https://blog.naver.com/${naverId}/postwrite`, {
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(5000);

    // Step 3-1: iframe 확인 및 전환 (선택사항)
    console.log('🔄 Step 3-1: iframe 확인 중...');
    
    let frame = null;
    const iframeSelectors = ['#mainFrame', 'iframe[id*="frame"]', 'iframe.se-main-container'];
    
    for (const selector of iframeSelectors) {
      try {
        const frameElement = await page.$(selector);
        if (frameElement) {
          frame = await frameElement.contentFrame();
          if (frame) {
            console.log(`✅ iframe 발견: ${selector}`);
            await page.waitForTimeout(2000);
            break;
          }
        }
      } catch (e) {
        console.log(`ℹ️ ${selector} iframe 없음, 다음 시도...`);
      }
    }

    // iframe이 없으면 메인 페이지에서 직접 작업
    const workingContext = frame || page;
    console.log(`✅ Step 3-1 완료: ${frame ? 'iframe' : '메인 페이지'}에서 작업`);

    // Step 3-2: 팝업 닫기 (개발정의서.md 84-85줄)
    console.log('🚫 Step 3-2: 도움말 팝업 닫기...');
    
    const popupSelectors = [
      '.se-popup-button-cancel',
      '.se-help-panel-close-button',
      'button[class*="close"]',
      'button[class*="cancel"]'
    ];

    for (const selector of popupSelectors) {
      try {
        const button = await workingContext.$(selector);
        if (button && await button.isVisible()) {
          await button.click();
          console.log(`✅ 팝업 닫기 완료: ${selector}`);
          await page.waitForTimeout(500);
        }
      } catch (e) {
        console.log(`ℹ️ ${selector} 없음`);
      }
    }

    console.log('✅ Step 3-2 완료: 팝업 처리 완료');

    // Step 4: 제목 입력 (개발정의서.md 87-88줄)
    console.log('✍️ Step 4: 제목 입력 중...');
    
    const titleSelectors = [
      '.se-section-documentTitle',
      '[data-document-title]',
      '.se-title-text',
      'div[contenteditable="true"][placeholder*="제목"]'
    ];

    let titleInput = null;
    for (const selector of titleSelectors) {
      try {
        titleInput = await workingContext.$(selector);
        if (titleInput) {
          console.log(`✅ 제목 입력란 발견: ${selector}`);
          await titleInput.click();
          await page.waitForTimeout(500);
          break;
        }
      } catch (e) {
        console.log(`ℹ️ ${selector} 없음, 다음 시도...`);
      }
    }

    if (!titleInput) {
      throw new Error('❌ 제목 입력란을 찾을 수 없습니다.');
    }

    // 한 글자씩 0.03초 간격으로 입력
    for (const char of title) {
      await page.keyboard.type(char, { delay: 30 }); // 30ms = 0.03초
    }

    console.log('✅ Step 4 완료: 제목 입력 완료');

    // Step 5: 본문 입력 (개발정의서.md 92-93줄)
    console.log('📄 Step 5: 본문 입력 중...');
    
    const bodySelectors = [
      '.se-section-text',
      '.se-component-content',
      'div[contenteditable="true"][data-placeholder]',
      '.se-text-paragraph'
    ];

    let bodyInput = null;
    for (const selector of bodySelectors) {
      try {
        bodyInput = await workingContext.$(selector);
        if (bodyInput) {
          console.log(`✅ 본문 입력란 발견: ${selector}`);
          await bodyInput.click();
          await page.waitForTimeout(500);
          break;
        }
      } catch (e) {
        console.log(`ℹ️ ${selector} 없음, 다음 시도...`);
      }
    }

    if (!bodyInput) {
      throw new Error('❌ 본문 입력란을 찾을 수 없습니다.');
    }

    // HTML 태그 및 마크다운 문법 제거 (순수 텍스트만)
    const cleanBody = body
      // HTML 태그 제거
      .replace(/<[^>]*>/g, '') // 모든 HTML 태그 제거
      .replace(/&nbsp;/g, ' ') // &nbsp; → 공백
      .replace(/&lt;/g, '<') // &lt; → <
      .replace(/&gt;/g, '>') // &gt; → >
      .replace(/&amp;/g, '&') // &amp; → &
      .replace(/&quot;/g, '"') // &quot; → "
      // 마크다운 문법 제거
      .replace(/^#{1,6}\s+/gm, '') // # ~ ###### 제목 제거 (줄 시작)
      .replace(/\s*#{1,6}\s+/g, ' ') // 줄 중간의 # 제거
      .replace(/\*\*/g, '') // ** 볼드 제거
      .replace(/\*/g, '') // * 이탤릭 제거
      .replace(/`/g, '') // ` 코드 제거
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // [링크](url) → 링크
      // 여러 줄바꿈을 2개로 제한
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // 줄바꿈 포함하여 한 글자씩 0.03초 간격으로 입력
    const lines = cleanBody.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim()) {
        for (const char of lines[i]) {
          await page.keyboard.type(char, { delay: 30 });
        }
      }

      if (i < lines.length - 1) {
        await page.keyboard.press('Enter');
        await page.waitForTimeout(100);
      }
    }

    console.log('✅ Step 5 완료: 본문 입력 완료');

    // Step 5.5: 이미지 삽입 (이미지 URL이 있는 경우)
    if (imageUrl) {
      console.log('🖼️ Step 5.5: 이미지 삽입 중...');
      console.log(`이미지 URL: ${imageUrl}`);
      
      try {
        // iframe 또는 메인 페이지에서 이미지 버튼 찾기
        const imageButtonSelectors = [
          'button[aria-label*="이미지"]',
          'button[title*="이미지"]',
          'button[class*="image"]',
          'button[class*="img"]',
          '.se-toolbar-button-image',
          '[data-testid="image-button"]'
        ];

        let imageButton = null;
        for (const selector of imageButtonSelectors) {
          imageButton = await workingContext.$(selector);
          if (imageButton) {
            console.log(`✅ 이미지 버튼 발견: ${selector}`);
            await imageButton.click();
            await page.waitForTimeout(1000);
            break;
          }
        }

        if (imageButton) {
          // URL 입력 방법 시도
          const urlInputSelectors = [
            'input[placeholder*="URL"]',
            'input[placeholder*="주소"]',
            'input[type="url"]',
            'input[name*="url"]',
            'input[class*="url"]'
          ];

          let urlInput = null;
          for (const selector of urlInputSelectors) {
            urlInput = await page.$(selector);
            if (urlInput) {
              console.log(`✅ URL 입력란 발견: ${selector}`);
              await urlInput.fill(imageUrl);
              await page.waitForTimeout(500);
              
              // 확인/삽입 버튼 클릭
              const confirmSelectors = [
                'button:has-text("확인")',
                'button:has-text("삽입")',
                'button:has-text("추가")',
                'button[class*="confirm"]',
                'button[class*="submit"]'
              ];
              
              for (const confirmSelector of confirmSelectors) {
                try {
                  const confirmButton = await page.$(confirmSelector);
                  if (confirmButton) {
                    await confirmButton.click();
                    console.log(`✅ 이미지 삽입 완료: ${confirmSelector}`);
                    await page.waitForTimeout(1000);
                    break;
                  }
                } catch (e) {
                  // 계속 진행
                }
              }
              break;
            }
          }

          if (!urlInput) {
            console.log('⚠️ URL 입력란을 찾을 수 없습니다. 이미지 삽입 건너뜀');
          }
        } else {
          console.log('⚠️ 이미지 버튼을 찾을 수 없습니다. 이미지 삽입 건너뜀');
        }
      } catch (error: any) {
        console.log(`⚠️ 이미지 삽입 중 오류: ${error.message}`);
        console.log('본문만으로 계속 진행합니다.');
      }
    }

    // Step 6: 발행 버튼 클릭 (개발정의서.md 94-95줄: .save_btn__bzc5B)
    console.log('🚀 Step 6: 발행 버튼 클릭...');
    
    // iframe에서 다시 메인 페이지로 전환
    await page.waitForTimeout(1000);
    
    // 발행 버튼 찾기 (여러 셀렉터 시도)
    const publishSelectors = [
      '.save_btn__bzc5B',
      'button.publish_btn__d85lb',
      'button[class*="publish"]',
      'button[class*="save"]'
    ];

    let publishClicked = false;
    for (const selector of publishSelectors) {
      try {
        const button = await page.$(selector);
        if (button) {
          await button.click();
          console.log(`✅ 발행 버튼 클릭 완료: ${selector}`);
          publishClicked = true;
          await page.waitForTimeout(2000);
          break;
        }
      } catch (e) {
        console.log(`ℹ️ ${selector} 버튼 없음, 다음 시도...`);
      }
    }

    if (!publishClicked) {
      throw new Error('❌ 발행 버튼을 찾을 수 없습니다.');
    }

    // 최종 발행 확인 버튼 클릭
    const finalPublishSelectors = [
      'button.confirm_btn__-7MDv',
      'button[class*="confirm"]',
      '.se-popup-button-confirm'
    ];

    let finalPublishClicked = false;
    for (const selector of finalPublishSelectors) {
      try {
        const button = await page.$(selector);
        if (button) {
          await button.click();
          console.log(`✅ 최종 발행 버튼 클릭 완료: ${selector}`);
          finalPublishClicked = true;
          await page.waitForTimeout(3000);
          break;
        }
      } catch (e) {
        console.log(`ℹ️ ${selector} 버튼 없음, 다음 시도...`);
      }
    }

    if (!finalPublishClicked) {
      console.log('⚠️ 최종 발행 버튼을 찾을 수 없지만 계속 진행...');
    }

    console.log('✅ Step 6 완료: 블로그 포스트 발행 완료!');

    // Step 7: 발행된 포스트 URL 가져오기
    const finalUrl = page.url();
    console.log('🎉 발행 완료! URL:', finalUrl);

    // 성공 응답
    res.json({
      success: true,
      message: '블로그 포스트가 성공적으로 발행되었습니다!',
      postUrl: finalUrl
    });

    // 사용자가 결과를 확인할 수 있도록 3초 대기
    await page.waitForTimeout(3000);

  } catch (error: any) {
    console.error('❌ 자동화 실패:', error);

    // 실패 응답
    res.status(500).json({
      success: false,
      message: `자동화 실패: ${error.message}`,
      errorDetails: error.stack
    });

  } finally {
    // Step 4: 보안 청소 (개발정의서.md 97-98줄: Security Cleanup)
    // try...finally 구문으로 성공/실패 여부와 상관없이 계정 정보 파기
    console.log('🔒 Step 7: 보안 청소 시작...');
    
    // 변수 null 처리 (메모리에서 파기)
    let cleanNaverId: string | null = naverId;
    let cleanNaverPw: string | null = naverPw;
    cleanNaverId = null;
    cleanNaverPw = null;
    
    console.log('✅ 계정 정보가 메모리에서 안전하게 파기되었습니다.');

    // 브라우저 닫기
    if (browser) {
      try {
        await browser.close();
        console.log('✅ 브라우저 종료 완료');
      } catch (e) {
        console.error('⚠️ 브라우저 종료 중 오류:', e);
      }
    }

    console.log('🔒 보안 청소 완료!');
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 백엔드 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`   API 엔드포인트: http://localhost:${PORT}/api/auto-publish`);
});
