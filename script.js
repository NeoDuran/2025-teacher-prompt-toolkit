document.addEventListener('DOMContentLoaded', function() {
    const topicDropdown = document.getElementById('topic-dropdown');
    const showPromptButton = document.getElementById('show-prompt');
    const promptTitle = document.getElementById('prompt-title');
    const promptText = document.getElementById('prompt-text');
    const copyButton = document.getElementById('copy-button');
    
    let currentPrompt = '';
    
    // 주제 ID와 파일 ID 매핑 테이블
    const topicToFileMap = {
        "1": "1", // 현장중심 교육시책 수립을 위한 교육정책 분석·개발 연구
        "2": "2", // 초등 공동교육과정 운영 방안 연구
        "3": "3", // IB 프로그램(PYP) 현장 적용 방안 연구
        "4": "4", // 초등 저학년 기초학습생활습관에 관한 연구
        "5": "5", // 좋은 습관 형성을 위한 유치원 교육활동 연구
        "6": "6", // 미술영재 교육과정 기관 운영에 관한 연구
        "7": "7", // 중학교 학교자율시간 과목 설계 및 교육학습자료 개발
        "8": "8", // 깊이 있는 학습과 학생 참여형 수업 활성화를 위한 교수·학습자료 개발
        "9": "9", // 학생의 성취와 성장을 돕는 학생평가 방안 연구
        "10": "10", // 학교급 전환기 수학 학습 지원 강화 프로그램 개발 연구
        "11": "11", // 장애영유아 조기발견을 위한 교육적 진단 역량 강화
        "12": "12", // 개정 교육과정 연계 실천 중심의 학교환경교육 프로그램 개발
        "13": "13", // 교원의 인성교육 지도 역량 강화 연수 프로그램 개발
        "14": "14", // 독서교육자료집 개발
        "15": "15", // 디지털 성폭력(딥페이크 등) 예방교육 자료 개발
        "16": "16", // 긍정적 행동지원 기반 통합교육
        "17": "17"  // 국내외 주요 교육정책 이슈와 동향 분석
    };
    
    // 프롬프트 불러오기 함수
    function fetchPrompt(topicId) {
        // 드롭다운에서 선택한 주제의 텍스트 가져오기
        const selectedOption = topicDropdown.options[topicDropdown.selectedIndex];
        const topicText = selectedOption.text;
        
        // 매핑 테이블에서 파일 ID 가져오기
        const fileId = topicToFileMap[topicId] || topicId;
        
        // 로딩 상태 표시
        promptText.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-3">프롬프트를 불러오는 중입니다...</p></div>';
        
        // 프롬프트 제목 업데이트
        promptTitle.textContent = topicText;
        
        // 다양한 경로를 시도하여 JSON 파일 로드
        const paths = [
            `/연구년프롬프트모음/prompt${fileId}.json`,
            `연구년프롬프트모음/prompt${fileId}.json`,
            `../연구년프롬프트모음/prompt${fileId}.json`,
            `./연구년프롬프트모음/prompt${fileId}.json`
        ];
        
        let pathIndex = 0;
        
        function tryNextPath() {
            if (pathIndex >= paths.length) {
                // 모든 경로 시도 실패
                promptText.innerHTML = `<div class="alert alert-danger"><i class="bi bi-exclamation-triangle-fill me-2"></i>프롬프트를 불러오는데 실패했습니다. 네트워크 연결을 확인하거나 관리자에게 문의하세요.</div>`;
                console.error('모든 경로에서 프롬프트 로드 실패');
                return;
            }
            
            const currentPath = paths[pathIndex];
            console.log(`Path ${pathIndex+1} 시도: ${currentPath}`);
            
            fetch(currentPath)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    // 전체 JSON 데이터를 pre 태그 안에 표시
                    const jsonString = JSON.stringify(data, null, 2);
                    promptText.innerHTML = `<pre>${jsonString}</pre>`;
                    console.log(`Path ${pathIndex+1} (${currentPath}) 로드 성공`);
                })
                .catch(error => {
                    console.error(`Path ${pathIndex+1} (${currentPath}) 로드 실패:`, error);
                    pathIndex++;
                    tryNextPath();
                });
        }
        
        tryNextPath();
    }
    
    // 프롬프트 버튼 클릭 이벤트
    showPromptButton.addEventListener('click', function() {
        const selectedTopicId = topicDropdown.value;
        
        if (!selectedTopicId) {
            // 주제가 선택되지 않은 경우
            promptText.innerHTML = `<div class="alert alert-warning"><i class="bi bi-info-circle-fill me-2"></i>연구 주제를 선택해주세요.</div>`;
            promptTitle.textContent = "선택된 프롬프트가 여기에 표시됩니다";
            return;
        }
        
        fetchPrompt(selectedTopicId);
    });
    
    // 복사 버튼 클릭 이벤트
    copyButton.addEventListener('click', function() {
        const textToCopy = promptText.innerText;
        
        if (textToCopy && !textToCopy.includes('연구 주제를 선택하세요') && !textToCopy.includes('프롬프트를 불러오는 중입니다')) {
            navigator.clipboard.writeText(textToCopy).then(function() {
                // 복사 성공 표시
                const originalText = copyButton.innerHTML;
                copyButton.innerHTML = '<i class="bi bi-check-circle me-1"></i> 복사됨';
                
                setTimeout(function() {
                    copyButton.innerHTML = originalText;
                }, 2000);
            }).catch(function(err) {
                console.error('복사 실패:', err);
                copyButton.textContent = '복사 실패';
                
                setTimeout(function() {
                    copyButton.innerHTML = '<i class="bi bi-clipboard me-1"></i> 복사하기';
                }, 2000);
            });
        }
    });
    
    // 드롭다운 변경 시 자동으로 프롬프트 표시
    topicDropdown.addEventListener('change', function() {
        const selectedTopicId = topicDropdown.value;
        if (selectedTopicId) {
            fetchPrompt(selectedTopicId);
        }
    });
}); 