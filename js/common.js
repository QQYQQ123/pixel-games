/**
 * PixelPlay 公共模块
 * - 用户昵称管理
 * - 排行榜系统
 */

// ========== 常量 ==========
const STORAGE_KEYS = {
    USER: 'pixelplay_user',
    RANK_PREFIX: 'pixelplay_rank_'
};

// ========== 用户管理 ==========
const UserManager = {
    // 获取当前用户
    getUser() {
        const data = localStorage.getItem(STORAGE_KEYS.USER);
        return data ? JSON.parse(data) : null;
    },
    
    // 设置用户昵称
    setNickname(nickname) {
        const user = this.getUser() || {};
        user.nickname = nickname.trim().substring(0, 12); // 最多12个字符
        user.createdAt = user.createdAt || new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        return user;
    },
    
    // 检查是否已设置昵称
    hasNickname() {
        const user = this.getUser();
        return user && user.nickname;
    },
    
    // 获取昵称（带默认值）
    getNickname() {
        const user = this.getUser();
        return user ? user.nickname : '玩家';
    }
};

// ========== 排行榜管理 ==========
const RankManager = {
    // 获取某游戏的排行榜
    getRankList(gameId) {
        const key = STORAGE_KEYS.RANK_PREFIX + gameId;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },
    
    // 保存排行榜
    saveRankList(gameId, list) {
        const key = STORAGE_KEYS.RANK_PREFIX + gameId;
        localStorage.setItem(key, JSON.stringify(list));
    },
    
    // 添加分数记录
    addScore(gameId, score, duration = 0) {
        const nickname = UserManager.getNickname();
        const list = this.getRankList(gameId);
        
        const record = {
            nickname,
            score,
            duration,
            time: new Date().toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
        };
        
        list.push(record);
        
        // 按分数降序排序
        list.sort((a, b) => b.score - a.score);
        
        // 只保留 TOP 20
        const topList = list.slice(0, 20);
        
        this.saveRankList(gameId, topList);
        
        // 返回当前排名
        const rank = topList.findIndex(r => 
            r.nickname === nickname && 
            r.score === score && 
            r.time === record.time
        ) + 1;
        
        return rank;
    },
    
    // 获取用户在某游戏的最佳成绩
    getBestScore(gameId) {
        const nickname = UserManager.getNickname();
        const list = this.getRankList(gameId);
        const userRecord = list.find(r => r.nickname === nickname);
        return userRecord ? userRecord.score : 0;
    },
    
    // 获取用户排名
    getUserRank(gameId) {
        const nickname = UserManager.getNickname();
        const list = this.getRankList(gameId);
        const index = list.findIndex(r => r.nickname === nickname);
        return index >= 0 ? index + 1 : null;
    }
};

// ========== UI 组件 ==========

// 显示昵称设置弹窗
function showNicknameModal(callback) {
    // 移除已存在的弹窗
    const existing = document.getElementById('nicknameModal');
    if (existing) existing.remove();
    
    const modal = document.createElement('div');
    modal.id = 'nicknameModal';
    modal.innerHTML = `
        <style>
            #nicknameModal {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(26, 26, 46, 0.98);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                padding: 20px;
            }
            .nn-container {
                background: var(--pixel-dark, #16213e);
                border: 4px solid var(--pixel-cyan, #00fff5);
                padding: 40px;
                max-width: 400px;
                width: 100%;
                text-align: center;
            }
            .nn-title {
                font-size: clamp(16px, 4vw, 24px);
                color: var(--pixel-cyan, #00fff5);
                margin-bottom: 24px;
                text-shadow: 0 0 10px var(--pixel-cyan, #00fff5);
            }
            .nn-subtitle {
                font-size: clamp(10px, 2vw, 12px);
                color: var(--pixel-gray, #6b7280);
                margin-bottom: 20px;
            }
            .nn-input {
                font-family: 'Press Start 2P', monospace;
                font-size: 14px;
                width: 100%;
                padding: 16px;
                background: var(--pixel-black, #1a1a2e);
                border: 3px solid var(--pixel-purple, #4a1942);
                color: var(--pixel-white, #f1f1f1);
                text-align: center;
                margin-bottom: 24px;
                outline: none;
            }
            .nn-input:focus {
                border-color: var(--pixel-cyan, #00fff5);
                box-shadow: 0 0 20px rgba(0, 255, 245, 0.3);
            }
            .nn-input::placeholder {
                color: var(--pixel-gray, #6b7280);
            }
            .nn-btn {
                font-family: 'Press Start 2P', monospace;
                font-size: 12px;
                padding: 16px 48px;
                background: var(--pixel-magenta, #e94560);
                border: none;
                color: var(--pixel-white, #f1f1f1);
                cursor: pointer;
                position: relative;
                transition: all 0.1s;
            }
            .nn-btn::before {
                content: '';
                position: absolute;
                top: -4px; left: -4px; right: -4px; bottom: -4px;
                border: 4px solid var(--pixel-cyan, #00fff5);
            }
            .nn-btn:hover {
                background: var(--pixel-cyan, #00fff5);
                color: var(--pixel-black, #1a1a2e);
            }
            .nn-hint {
                font-size: 8px;
                color: var(--pixel-gray, #6b7280);
                margin-top: 16px;
            }
        </style>
        <div class="nn-container">
            <h1 class="nn-title">🎮 欢迎来到 PixelPlay</h1>
            <p class="nn-subtitle">请输入你的游戏昵称</p>
            <input type="text" class="nn-input" id="nnInput" placeholder="最多12个字符" maxlength="12" autocomplete="off">
            <button class="nn-btn" id="nnBtn">确认开始游戏</button>
            <p class="nn-hint">昵称将用于排行榜显示</p>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const input = modal.querySelector('#nnInput');
    const btn = modal.querySelector('#nnBtn');
    
    // 聚焦输入框
    setTimeout(() => input.focus(), 100);
    
    // 预填充已有昵称
    const currentUser = UserManager.getUser();
    if (currentUser && currentUser.nickname) {
        input.value = currentUser.nickname;
    }
    
    // 确认按钮
    btn.addEventListener('click', () => {
        const nickname = input.value.trim();
        if (nickname) {
            UserManager.setNickname(nickname);
            modal.remove();
            if (callback) callback();
        }
    });
    
    // 回车确认
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            btn.click();
        }
    });
}

// 显示排行榜弹窗
function showRankModal(gameId, gameName) {
    // 移除已存在的弹窗
    const existing = document.getElementById('rankModal');
    if (existing) existing.remove();
    
    const list = RankManager.getRankList(gameId);
    const userRank = RankManager.getUserRank(gameId);
    const bestScore = RankManager.getBestScore(gameId);
    
    const modal = document.createElement('div');
    modal.id = 'rankModal';
    modal.innerHTML = `
        <style>
            #rankModal {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(26, 26, 46, 0.98);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                padding: 20px;
            }
            .rank-container {
                background: var(--pixel-dark, #16213e);
                border: 4px solid var(--pixel-purple, #4a1942);
                padding: 24px;
                max-width: 500px;
                width: 100%;
                max-height: 80vh;
                overflow-y: auto;
            }
            .rank-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 12px;
                border-bottom: 2px solid var(--pixel-purple, #4a1942);
            }
            .rank-title {
                font-size: clamp(14px, 3vw, 18px);
                color: var(--pixel-yellow, #ffdd00);
            }
            .rank-close {
                background: none;
                border: 2px solid var(--pixel-gray, #6b7280);
                color: var(--pixel-gray, #6b7280);
                font-family: inherit;
                font-size: 16px;
                width: 32px;
                height: 32px;
                cursor: pointer;
            }
            .rank-close:hover {
                border-color: var(--pixel-magenta, #e94560);
                color: var(--pixel-magenta, #e94560);
            }
            .rank-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .rank-item {
                display: grid;
                grid-template-columns: 40px 1fr 80px 60px;
                gap: 12px;
                align-items: center;
                padding: 12px;
                background: var(--pixel-black, #1a1a2e);
                border: 2px solid var(--pixel-dark, #16213e);
            }
            .rank-item.top3 {
                border-color: var(--pixel-yellow, #ffdd00);
            }
            .rank-item.current {
                border-color: var(--pixel-cyan, #00fff5);
                background: rgba(0, 255, 245, 0.1);
            }
            .rank-pos {
                font-size: 12px;
                text-align: center;
            }
            .rank-pos.gold { color: #ffd700; }
            .rank-pos.silver { color: #c0c0c0; }
            .rank-pos.bronze { color: #cd7f32; }
            .rank-name {
                font-size: 10px;
                color: var(--pixel-white, #f1f1f1);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .rank-score {
                font-size: 12px;
                color: var(--pixel-yellow, #ffdd00);
                text-align: right;
            }
            .rank-time {
                font-size: 8px;
                color: var(--pixel-gray, #6b7280);
                text-align: right;
            }
            .rank-empty {
                text-align: center;
                padding: 40px;
                color: var(--pixel-gray, #6b7280);
                font-size: 10px;
            }
            .rank-footer {
                margin-top: 20px;
                padding-top: 12px;
                border-top: 2px solid var(--pixel-purple, #4a1942);
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 10px;
            }
            .rank-mybest {
                color: var(--pixel-cyan, #00fff5);
            }
            .rank-myrank {
                color: var(--pixel-yellow, #ffdd00);
            }
        </style>
        <div class="rank-container">
            <div class="rank-header">
                <h2 class="rank-title">🏆 排行榜 - ${gameName}</h2>
                <button class="rank-close" id="rankClose">×</button>
            </div>
            <div class="rank-list" id="rankList">
                ${list.length === 0 ? '<div class="rank-empty">暂无记录<br>快来创造第一个记录吧！</div>' : 
                    list.map((item, index) => {
                        const isCurrent = item.nickname === UserManager.getNickname();
                        const posClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
                        const itemClass = (index < 3 ? 'top3 ' : '') + (isCurrent ? 'current' : '');
                        const posIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
                        return `
                            <div class="rank-item ${itemClass}">
                                <span class="rank-pos ${posClass}">${posIcon}</span>
                                <span class="rank-name">${item.nickname}</span>
                                <span class="rank-score">${item.score.toLocaleString()}</span>
                                <span class="rank-time">${item.time}</span>
                            </div>
                        `;
                    }).join('')
                }
            </div>
            <div class="rank-footer">
                <span class="rank-mybest">我的最佳: ${bestScore > 0 ? bestScore.toLocaleString() : '-'}</span>
                <span class="rank-myrank">我的排名: ${userRank ? '#' + userRank : '-'}</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 关闭按钮
    modal.querySelector('#rankClose').addEventListener('click', () => {
        modal.remove();
    });
    
    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// 初始化：检查昵称
function initPixelPlay(callback) {
    if (!UserManager.hasNickname()) {
        showNicknameModal(callback);
    } else if (callback) {
        callback();
    }
}

// 导出全局对象
window.PixelPlay = {
    UserManager,
    RankManager,
    showNicknameModal,
    showRankModal,
    initPixelPlay
};
