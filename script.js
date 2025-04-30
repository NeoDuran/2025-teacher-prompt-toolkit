document.addEventListener('DOMContentLoaded', function() {
    const topicDropdown = document.getElementById('topic-dropdown');
    const showPromptButton = document.getElementById('show-prompt');
    const promptTitle = document.getElementById('prompt-title');
    const promptText = document.getElementById('prompt-text');
    const copyButton = document.getElementById('copy-button');
    
    let currentPrompt = '';
    
    // 주제 ID와 JSON 파일 매핑 테이블
    // 만약 중간에 매칭이 어긋난 경우 이 매핑을 조정하면 됩니다
    const topicToFileMap = {
        "1": "1", // 현장중심 교육시책 수립을 위한 교육정책 분석·개발 연구
        "2": "2", // 초등 공동교육과정 운영 방안 연구
        "3": "3", // IB 프로그램(PYP) 현장 적용 방안 연구
        "4": "4", // 초등 저학년 기초학습생활습관에 관한 연구
        "5": "5", // 좋은 습관 형성을 위한 유치원 교육활동 연구
        "6": "6", // 미술영재 교육과정 기관 운영에 관한 연구
        "7": "7", // 중학교 학교자율시간 과목 설계 및 교육학습자료 개발
        "8": "8", // 깊이 있는 학습과 학생 참여형 수업 활성화를 위한 교수·학습자료 개발
        "9": "9", // IB 프로그램(MYP, DP) 현장 적용 방안 연구
        "10": "10", // 학생의 성취와 성장을 돕는 학생평가 방안 연구
        "11": "11", // 학교급 전환기 수학 학습 지원 강화 프로그램 개발 연구
        "12": "12", // 장애영유아 조기발견을 위한 교육적 진단 역량 강화
        "13": "13", // 개정 교육과정 연계 실천 중심의 학교환경교육 프로그램 개발
        "14": "14", // 교원의 인성교육 지도 역량 강화 연수 프로그램 개발
        "15": "15", // 독서교육자료집 개발
        "16": "16", // 디지털 성폭력(딥페이크 등) 예방교육 자료 개발
        "17": "17", // 긍정적 행동지원 기반 통합교육
        "18": "18"  // 국내외 주요 교육정책 이슈와 동향 분석
    };
    
    // 프롬프트 파일 불러오기
    async function fetchPrompt(topicId) {
        // 주제 ID에 해당하는 파일 ID 가져오기
        const fileId = topicToFileMap[topicId] || topicId;
        console.log(`주제 ID ${topicId}에 해당하는 파일 ID: ${fileId}`);
        
        // 시도할 경로 목록 (파일 이름 그대로 사용)
        const paths = [
            `/연구년프롬프트모음/prompt${fileId}.json`,
            `연구년프롬프트모음/prompt${fileId}.json`,
            `../연구년프롬프트모음/prompt${fileId}.json`,
            `./연구년프롬프트모음/prompt${fileId}.json`
        ];
        
        let lastError = null;
        
        // 각 경로를 시도
        for (const path of paths) {
            try {
                console.log(`파일 로드 시도: ${path}`);
                const response = await fetch(path);
                if (response.ok) {
                    console.log(`${path} 로드 성공`);
                    return await response.json();
                }
            } catch (error) {
                console.warn(`${path} 경로로 파일을 불러오는데 실패했습니다:`, error);
                lastError = error;
            }
        }
        
        // 모든 경로가 실패한 경우
        console.error('모든 경로에서 프롬프트를 불러오는데 실패했습니다:', lastError);
        return null;
    }
    
    // 선택한 주제에 맞는 프롬프트 표시
    showPromptButton.addEventListener('click', async function() {
        const selectedTopic = topicDropdown.value;
        
        if (!selectedTopic) {
            promptTitle.textContent = '연구 주제를 선택해주세요';
            promptText.innerHTML = '<p class="text-center text-danger">왼쪽에서 연구 주제를 먼저 선택하세요.</p>';
            return;
        }
        
        // 로딩 표시
        promptTitle.textContent = '프롬프트 불러오는 중...';
        promptText.innerHTML = '<p class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></p>';
        
        try {
            // 선택한 옵션의 텍스트로 제목 설정
            const selectedOption = topicDropdown.options[topicDropdown.selectedIndex];
            promptTitle.textContent = selectedOption.textContent;
            
            // 해당 주제에 맞는 JSON 파일 로드
            const data = await fetchPrompt(selectedTopic);
            
            if (data) {
                // 전체 JSON 데이터를 문자열로 변환 (들여쓰기 포함)
                const jsonString = JSON.stringify(data, null, 2);
                currentPrompt = jsonString;
                
                // JSON 형식 그대로 표시
                promptText.innerHTML = `<pre class="mb-0 overflow-auto"><code>${jsonString}</code></pre>`;
                
                console.log(`프롬프트 ${selectedTopic} 로드 완료`);
            } else {
                throw new Error('데이터를 불러올 수 없습니다.');
            }
        } catch (error) {
            console.error('프롬프트 로드 오류:', error);
            promptTitle.textContent = '오류 발생';
            promptText.innerHTML = `
                <p class="text-center text-danger mb-4">
                    <i class="bi bi-exclamation-triangle-fill fs-1"></i><br>
                    프롬프트를 불러오는 중 오류가 발생했습니다.
                </p>
                <p class="text-center">
                    JSON 파일 경로가 올바른지 확인해주세요.<br>
                    '연구년프롬프트모음' 폴더가 웹 서버의 루트 디렉토리에 있어야 합니다.<br>
                    <span class="text-danger">오류 내용: ${error.message}</span>
                </p>
            `;
        }
    });
    
    // 프롬프트 복사 기능
    copyButton.addEventListener('click', function() {
        if (currentPrompt) {
            navigator.clipboard.writeText(currentPrompt).then(function() {
                // 복사 성공 알림
                const originalText = copyButton.innerHTML;
                copyButton.innerHTML = '<i class="bi bi-check-circle me-1"></i> 복사됨';
                copyButton.classList.add('btn-success');
                
                setTimeout(function() {
                    copyButton.innerHTML = originalText;
                    copyButton.classList.remove('btn-success');
                }, 2000);
            }).catch(function(err) {
                console.error('프롬프트 복사 중 오류가 발생했습니다:', err);
                copyButton.textContent = '복사 실패';
            });
        }
    });
    
    // 드롭다운에서 직접 선택 시에도 프롬프트 표시 (선택 사항)
    topicDropdown.addEventListener('change', function() {
        const selectedTopic = topicDropdown.value;
        if (selectedTopic) {
            // 버튼을 자동으로 클릭하여 프롬프트 표시
            showPromptButton.click();
        }
    });
}); 