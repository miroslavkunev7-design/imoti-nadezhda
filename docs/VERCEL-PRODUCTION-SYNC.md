# Синхронизация Desktop ↔ Vercel Production

## Последен Production deploy

| Поле | Стойност |
|------|----------|
| URL | https://imoti-nadezhda.vercel.app |
| Git commit | `a4b4ad405a2f0a103a0305097ec1b9c53b6b062e` (кратко `a4b4ad4`) |
| Дата | 2026-05-31 ~13:28 UTC |
| Съдържание | Full HD hero, fullscreen Burgas, marble ribbon, Supabase seed scripts |

GitHub `master` = същият commit.

## На Windows Desktop (препоръчително)

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\sync-desktop-from-vercel.ps1
```

Скриптът:

1. Прави **backup** на старата `imoti-nadezhda` → `imoti-nadezhda.backup-ДАТА`
2. **Изтегля** свеж clone от GitHub на commit `a4b4ad4`
3. **Заменя** папката на работния плот
4. `npm install` + `npm run burgas:hero`

## Ръчно (алтернатива)

```powershell
cd $env:USERPROFILE\Desktop
Rename-Item imoti-nadezhda imoti-nadezhda.old -ErrorAction SilentlyContinue
git clone https://github.com/miroslavkunev7-design/imoti-nadezhda.git imoti-nadezhda
cd imoti-nadezhda
git checkout a4b4ad4
npm install
npm run dev
```
