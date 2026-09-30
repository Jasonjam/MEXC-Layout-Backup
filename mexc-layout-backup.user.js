// ==UserScript==
// @name         MEXC Backup
// @namespace    mexc-backup
// @version      0.2.0
// @description  S/L MEXC "Layout / TradingView" settings, and hide the notification banner
// @match        https://www.mexc.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict'

    const DEFAULT_TOP = 120
    const POSITION_KEY = 'mexc_backup_menu_top'

    const savedTop = localStorage.getItem(POSITION_KEY)
    let initialTop = DEFAULT_TOP
    if (savedTop !== null) {
        const top = Number(savedTop)

        if (Number.isFinite(top) && top >= 0) {
            initialTop = top
        }
    }

    const style = document.createElement('style')

    style.textContent = `
    :root {
        --mexc-backup-bg: #426756;
        --mexc-backup-border: #34363d;
        --mexc-backup-text: snow;
        --mexc-backup-text-secondary: snow;
        --mexc-backup-hover: #2a2d35;
        --mexc-backup-separator: #34363d;
    }

    #mexc-backup-menu {
        position: fixed;
        top: ${initialTop}px;
        right: 0;
        z-index: 999999;

        font-family: Arial, sans-serif;
        font-size: 12px;
        color: var(--mexc-backup-text);
    }

    #mexc-backup-toggle {
        width: 75px;
        min-height: 35px;

        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;

        background: var(--mexc-backup-bg);
        border: 1px solid var(--mexc-backup-border);
        border-right: 0;
        border-radius: 6px 0 0 6px;

        cursor: grab;
        user-select: none;
    }

    #mexc-backup-toggle:active {
        cursor: grabbing;
    }

    #mexc-backup-title {
        display: flex;
        flex-direction: column;
        align-items: center;

        text-align: center;
        line-height: 1.2;

        padding-top: 3px;
    }

    #mexc-backup-arrow {
        margin-left: 6%;

        font-size: 9px;
        flex-shrink: 0;

        transition: transform 0.15s ease;
    }

    #mexc-backup-menu.open #mexc-backup-arrow {
        transform: rotate(180deg);
    }

    #mexc-backup-dropdown {
        position: absolute;
        top: 0;
        right: calc(100% + 4px);

        width: 120px;
        padding: 4px;

        background: var(--mexc-backup-bg);
        border: 1px solid var(--mexc-backup-border);
        border-radius: 6px;

        box-sizing: border-box;
        display: none;

        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
    }

    #mexc-backup-menu.open #mexc-backup-dropdown {
        display: block;
    }

    #mexc-backup-options-title {
        padding: 5px 8px 6px;

        color: var(--mexc-backup-text-secondary);
        font-size: 11px;
        font-weight: 500;

        user-select: none;
    }

    .mexc-backup-option {
        height: 28px;
        padding: 0 8px;

        display: flex;
        align-items: center;
        gap: 7px;

        border-radius: 4px;

        cursor: pointer;
        user-select: none;
    }

    .mexc-backup-option:hover {
        background: var(--mexc-backup-hover);
    }

    .mexc-backup-option input {
        width: 13px;
        height: 13px;
        margin: 0;

        cursor: pointer;
    }

    .mexc-backup-separator {
        height: 1px;
        margin: 5px 4px;

        background: var(--mexc-backup-separator);
    }

    .mexc-backup-item {
        height: 32px;
        padding: 0 10px;

        display: flex;
        align-items: center;

        border-radius: 4px;

        cursor: pointer;
        user-select: none;
    }

    .mexc-backup-item:hover {
        background: var(--mexc-backup-hover);
    }

    /* 隱藏 MEXC 合約頁上方廣播 */
    [data-testid="contract-newstickers"] {
        display: none !important;
    }
`

    document.head.appendChild(style)

    const menu = document.createElement('div')
    menu.id = 'mexc-backup-menu'

    menu.innerHTML = `
    <div id="mexc-backup-toggle">
        <div id="mexc-backup-title">
            <div>MEXC</div>
            <div>BACKUP</div>
        </div>

        <span id="mexc-backup-arrow">▼</span>
    </div>

    <div id="mexc-backup-dropdown">
        <div id="mexc-backup-options-title">
            Backup Options
        </div>

        <label class="mexc-backup-option">
            <input
                type="checkbox"
                id="mexc-backup-layout"
                checked
            >
            <span>Layout</span>
        </label>

        <label class="mexc-backup-option">
            <input
                type="checkbox"
                id="mexc-backup-tvfx"
                checked
            >
            <span>TV-FX</span>
        </label>

        <div class="mexc-backup-separator"></div>

        <div class="mexc-backup-item" id="mexc-backup-save">
            Backup
        </div>

        <div class="mexc-backup-item" id="mexc-backup-restore">
            Restore
        </div>
    </div>
`

    document.body.appendChild(menu)

    const toggle = document.querySelector('#mexc-backup-toggle')
    const backup = document.querySelector('#mexc-backup-save')
    const restore = document.querySelector('#mexc-backup-restore')
    const layoutCheckbox = document.querySelector('#mexc-backup-layout')
    const tvFxCheckbox = document.querySelector('#mexc-backup-tvfx')

    let isDragging = false
    let hasMoved = false
    let startY = 0
    let startTop = 0

    toggle.addEventListener('mousedown', event => {
        if (event.button !== 0) {
            return
        }

        isDragging = true
        hasMoved = false
        startY = event.clientY
        startTop = menu.offsetTop

        event.preventDefault()
    })

    document.addEventListener('mousemove', event => {
        if (!isDragging) {
            return
        }

        const deltaY = event.clientY - startY

        if (Math.abs(deltaY) > 3) {
            hasMoved = true
        }

        let newTop = startTop + deltaY

        const maxTop = window.innerHeight - menu.offsetHeight

        if (newTop < 0) {
            newTop = 0
        }

        if (newTop > maxTop) {
            newTop = maxTop
        }

        menu.style.top = `${newTop}px`
    })

    document.addEventListener('mouseup', () => {
        if (!isDragging) {
            return
        }

        isDragging = false

        localStorage.setItem(
            POSITION_KEY,
            String(menu.offsetTop)
        )
    })

    toggle.addEventListener('click', event => {
        if (hasMoved) {
            hasMoved = false
            return
        }

        menu.classList.toggle('open')
        event.stopPropagation()
    })

// 備份功能
async function getIndexedDBValue(dbName, dbVersion, storeName, key) {
    const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion)

        request.onsuccess = () => {
            resolve(request.result)
        }

        request.onerror = () => {
            reject(request.error)
        }
    })

    const value = await new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly')
        const store = transaction.objectStore(storeName)
        const request = store.get(key)

        request.onsuccess = () => {
            resolve(request.result)
        }

        request.onerror = () => {
            reject(request.error)
        }
    })

    db.close()

    return value
}

function downloadBackup(data) {
    const now = new Date()

    const date =
        String(now.getFullYear()) +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0')

    const time =
        String(now.getHours()).padStart(2, '0') +
        String(now.getMinutes()).padStart(2, '0') +
        String(now.getSeconds()).padStart(2, '0')

    const filename = `mexc-layout-backup-${date}-${time}.json`

    const json = JSON.stringify(data, null, 4)

    const blob = new Blob(
        [json],
        {
            type: 'application/json'
        }
    )

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = filename

    document.body.appendChild(link)
    link.click()
    link.remove()

    URL.revokeObjectURL(url)
}

async function backupMexc() {
    try {
        const backupData = {
            backupVersion: 1,
            createdAt: new Date().toISOString()
        }

        if (layoutCheckbox.checked) {
            const layout = localStorage.getItem(
                'mexc_contract_vertical_layout_v5'
            )

            if (!layout) {
                throw new Error(
                    '找不到 mexc_contract_vertical_layout_v5'
                )
            }

            backupData.layout = {
                mexc_contract_vertical_layout_v5: layout
            }
        }

        if (tvFxCheckbox.checked) {
            const chartLib = localStorage.getItem(
                'mxc_contract_kline_lib'
            )

            const tradingView = await getIndexedDBValue(
                'mexc',
                3,
                'contract_v2',
                'mxc_contract_kline_tv_pre_chart'
            )

            if (!chartLib) {
                throw new Error(
                    '找不到 mexc_contract_kline_lib'
                )
            }

            if (!tradingView) {
                throw new Error(
                    '找不到 TradingView IndexedDB 資料'
                )
            }

            backupData.tvFx = {
                mexc_contract_kline_lib: chartLib,
                mxc_contract_kline_tv_pre_chart: tradingView
            }
        }

        if (!layoutCheckbox.checked && !tvFxCheckbox.checked) {
            throw new Error('請至少選擇一個備份項目')
        }

        downloadBackup(backupData)

        console.log(
            '[MEXC Backup] Backup completed',
            backupData
        )
    } catch (error) {
        console.error(
            '[MEXC Backup] Backup failed:',
            error
        )

        alert(
            'MEXC Backup 失敗\n\n' +
            String(error)
        )
    }
}

backup.addEventListener('click', async () => {
    menu.classList.remove('open')

    await backupMexc()
})

// 還原功能
async function setIndexedDBValue(
    dbName,
    dbVersion,
    storeName,
    key,
    value
) {
    const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion)

        request.onsuccess = () => {
            resolve(request.result)
        }

        request.onerror = () => {
            reject(request.error)
        }
    })

    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)

    await new Promise((resolve, reject) => {
        const request = store.put(value, key)

        request.onsuccess = () => {
            resolve()
        }

        request.onerror = () => {
            reject(request.error)
        }
    })

    await new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
            resolve()
        }

        transaction.onerror = () => {
            reject(transaction.error)
        }

        transaction.onabort = () => {
            reject(transaction.error)
        }
    })

    db.close()
}

async function restoreMexc(backupData) {
    if (backupData.backupVersion !== 1) {
        throw new Error('不支援的 Backup Version')
    }

    const hasLayout =
        backupData.layout?.mexc_contract_vertical_layout_v5 !== undefined

    const hasTvFx =
        backupData.tvFx?.mexc_contract_kline_lib !== undefined &&
        backupData.tvFx?.mxc_contract_kline_tv_pre_chart !== undefined

    if (!hasLayout && !hasTvFx) {
        throw new Error('Backup 檔案沒有可還原的資料')
    }

    if (hasLayout) {
        const layout =
            backupData.layout.mexc_contract_vertical_layout_v5

        localStorage.setItem(
            'mexc_contract_vertical_layout_v5',
            layout
        )

        const restoredLayout = localStorage.getItem(
            'mexc_contract_vertical_layout_v5'
        )

        if (restoredLayout !== layout) {
            throw new Error('Layout 驗證失敗')
        }

        console.log('[MEXC Backup] Layout restored')
    }

    if (hasTvFx) {
        const chartLib =
            backupData.tvFx.mexc_contract_kline_lib

        const tradingView =
            backupData.tvFx.mxc_contract_kline_tv_pre_chart

        localStorage.setItem(
            'mxc_contract_kline_lib',
            chartLib
        )

        await setIndexedDBValue(
            'mexc',
            3,
            'contract_v2',
            'mxc_contract_kline_tv_pre_chart',
            tradingView
        )

        const restoredChartLib = localStorage.getItem(
            'mxc_contract_kline_lib'
        )

        if (restoredChartLib !== chartLib) {
            throw new Error('TV-FX Chart Lib 驗證失敗')
        }

        const restoredTradingView =
            await getIndexedDBValue(
                'mexc',
                3,
                'contract_v2',
                'mxc_contract_kline_tv_pre_chart'
            )

        if (
            JSON.stringify(restoredTradingView) !==
            JSON.stringify(tradingView)
        ) {
            throw new Error(
                'TV-FX TradingView 驗證失敗'
            )
        }

        console.log('[MEXC Backup] TV-FX restored')
    }

    console.log('[MEXC Backup] Restore completed')

    location.reload()
}

function selectBackupFile() {
    const input = document.createElement('input')

    input.type = 'file'
    input.accept = '.json'

    input.addEventListener('change', async () => {
        const file = input.files?.[0]

        if (file) {
            try {
                const text = await file.text()
                const backup = JSON.parse(text)

                await restoreMexc(backup)
            } catch (error) {
                console.error(
                    '[MEXC Backup] Restore failed:',
                    error
                )

                alert(
                    'MEXC Restore 失敗\n\n' +
                    String(error)
                )
            }
        }
    })

    input.click()
}

restore.addEventListener('click', () => {
    menu.classList.remove('open')

    selectBackupFile()
})


    document.addEventListener('click', event => {
        if (!menu.contains(event.target)) {
            menu.classList.remove('open')
        }
    })
})()
