document.addEventListener('DOMContentLoaded', function() {
    const topicDropdown = document.getElementById('topic-dropdown');
    const showPromptButton = document.getElementById('show-prompt');
    const promptTitle = document.getElementById('prompt-title');
    const promptText = document.getElementById('prompt-text');
    const copyButton = document.getElementById('copy-button');
    
    let currentPrompt = '';
    
    // 프롬프트 파일 불러오기
    async function fetchPrompt(topicId) {
        // 시도할 경로 목록
        const paths = [
            `/연구년프롬프트모음/prompt${topicId}.json`,
            `연구년프롬프트모음/prompt${topicId}.json`,
            `../연구년프롬프트모음/prompt${topicId}.json`,
            `./연구년프롬프트모음/prompt${topicId}.json`
        ];
        
        let lastError = null;
        
        // 각 경로를 시도
        for (const path of paths) {
            try {
                const response = await fetch(path);
                if (response.ok) {
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
        
        const data = await fetchPrompt(selectedTopic);
        
        if (data) {
            const selectedOption = topicDropdown.options[topicDropdown.selectedIndex];
            promptTitle.textContent = selectedOption.textContent;
            
            // 프롬프트 텍스트 표시
            const promptContent = data.Optimised_Prompt;
            currentPrompt = promptContent;
            
            // 프롬프트 내용을 마크다운 형식으로 표시
            const formattedPrompt = promptContent.replace(/\n/g, '<br>');
            promptText.innerHTML = `<pre class="mb-0"><code>${formattedPrompt}</code></pre>`;
        } else {
            promptTitle.textContent = '오류 발생';
            promptText.innerHTML = `
                <p class="text-center text-danger mb-4">
                    <i class="bi bi-exclamation-triangle-fill fs-1"></i><br>
                    프롬프트를 불러오는 중 오류가 발생했습니다.
                </p>
                <p class="text-center">
                    JSON 파일 경로가 올바른지 확인해주세요.<br>
                    '연구년프롬프트모음' 폴더가 웹 서버의 루트 디렉토리에 있어야 합니다.
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