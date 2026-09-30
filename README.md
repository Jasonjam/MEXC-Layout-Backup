# MEXC Backup

MEXC 合約交易頁面 Layout / TradingView指標 的備份與還原 Tampermonkey 腳本。

## 安裝

[安裝 MEXC Backup](https://raw.githubusercontent.com/Jasonjam/mexc-backup/main/mexc-backup.user.js)

## 功能

- 備份 / 還原 MEXC Layout & TradingView 圖表設定與指標
- 可選擇備份 `Layout` / `TV-FX`
- Restore 依 備份.json 內容自動決定還原項目
- 隱藏合約頁面上方的通知廣播

## 備份內容

**Layout**

Local Storage：

`mexc_contract_vertical_layout_v5`

包含 `lg`、`llg` 等不同版型，實際使用的版型可能受到瀏覽器視窗寬度與縮放比例影響。

**TV-FX**

Local Storage：

`mxc_contract_kline_lib`

IndexedDB：

`mexc → contract_v2 → mxc_contract_kline_tv_pre_chart`

TradingView 採完整設定備份，包含 MA 等圖表指標。

## 注意

腳本依賴 MEXC 目前的 Local Storage、IndexedDB 與 DOM 結構。

MEXC 網站更新後，相關 Key 或頁面結構可能需要同步修改。
