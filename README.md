# Maplewood Book Club & School Analytics Platform 📚📊

แอปพลิเคชันระบบส่งเสริมการอ่านและแดชบอร์ดควบคุมสำหรับคุณครูและนักเรียน โดยพัฒนาด้วย **React (Vite) + TypeScript + Tailwind CSS** และเชื่อมต่อระบบฐานข้อมูลและการล็อกอินแบบเรียลไทม์ด้วย **Firebase Firestore & Authentication**

---

## 🛠️ วิธีการเอาโค้ดขึ้น GitHub (How to sync to GitHub)

หากคุณใช้งานผ่าน Google AI Studio และต้องการนำโปรเจกต์นี้ไปใส่ไว้ใน GitHub ส่วนตัว ให้ทำตามขั้นตอนดังนี้:

1. **ดาวน์โหลดโปรเจกต์ (Export Project)**
   - ไปที่ปุ่มเมนูการตั้งค่า (Settings/Export) ในหน้าต่าง Google AI Studio ของคุณ แล้วเลือก **Export to ZIP** หรือ **Push to GitHub**
   - หากเลือก ZIP ให้แตกไฟล์ไว้ในเครื่องของคุณ

2. **สร้าง Git Repository ใหม่ (หากเริ่มต้นจากศูนย์)**
   เปิด Terminal ไปยังโฟลเดอร์ของโปรเจกต์นี้และรันคำสั่ง:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Maplewood Reading Hub with Admin Dashboard"
   ```

3. **เชื่อมต่อไปยัง GitHub ของคุณ**
   - เข้าไปสร้าง Repository ใหม่ในเว็บ [GitHub](https://github.com/) ของคุณ (เลือกแบบ Private หรือ Public ก็ได้)
   - คัดลอก URL ของ Repository มาแล้วรันคำสั่งเชื่อมต่อ:
     ```bash
     git remote add origin <YOUR_GITHUB_REPO_URL>
     git branch -M main
     git push -u origin main
     ```

---

## 🚀 วิธีการ Deploy ขึ้นสู่ Netlify (How to Deploy to Netlify)

แอปพลิเคชันนี้ได้รับการจัดวางโครงสร้างและตั้งค่า `netlify.toml` แบบสมบูรณ์แล้ว ซึ่งพร้อมอัปโหลดและทำงานบน Netlify ได้ทันทีโดยไม่ต้องแก้ไขค่าใดๆ เพิ่มเติม!

### ขั้นตอนที่ 1: เชื่อมต่อ GitHub กับ Netlify (วิธีที่ดีที่สุด - Auto-Publish)
1. ลงชื่อเข้าใช้ [Netlify](https://www.netlify.com/)
2. คลิกปุ่ม **Add new site** > เลือก **Import from Git**
3. เลือก **GitHub** และอนุญาตสิทธิ์การเข้าถึงคลังโค้ดของคุณ
4. เลือก repository ของแอปพลิเคชันนี้

### ขั้นตอนที่ 2: ตั้งค่าการ Build (Build Settings)
เนื่องจากเราได้สร้างไฟล์ `netlify.toml` ไว้ให้เป็นมาตรฐานแล้ว ระบบจะดึงข้อมูลไปตรวจจับอัตโนมัติ:
* **Build Command:** `npm run build`
* **Publish Directory:** `dist`

### ขั้นตอนที่ 3: ตั้งค่า Environment Variables (ถ้ามี)
หากในอนาคตมีการเรียกใช้ API ฝั่งเซิร์ฟเวอร์ หรือ API Keys อื่นๆ เช่น `GEMINI_API_KEY`:
1. ไปที่เมนู **Site configuration** > **Environment variables** ในระบบควบคุมของ Netlify
2. คลิก **Add a variable** จากนั้นกรอก Key และ Value ที่ต้องการใช้

### ขั้นตอนที่ 4: เสร็จสิ้นการ Deploy 🎉
* คลิก **Deploy site**
* Netlify จะทำการดาวน์โหลด Dependencies, ตรวจทานโค้ด และสั่ง Build สู่โครงสร้างจริง คุณจะได้ URL เว็บไซต์ที่พร้อมใช้งานทันที เช่น `https://your-site-name.netlify.app`
* เมื่อใดก็ตามที่คุณกด `git push` ส่งโค้ดใหม่เข้า GitHub, ระบบ Netlify จะอัปเดตเวอร์ชันเว็บและปรับโครงสร้างสดใหม่อัตโนมัติ!

---

## 📦 การพับลิชแบบ Manual (หรืออัปโหลดแบบ Zip Drag & Drop)
หากคุณไม่อยากผูก GitHub ก็ยังสามารถ Deploy แมนนวลได้ดังนี้:
1. สั่งรันคำสั่งต่อไปนี้เพื่อรวมโค้ดให้พร้อมใช้งาน:
   ```bash
   npm install
   npm run build
   ```
2. โค้ดทั้งหมดจะไปกองรวมกันอย่างเสถียรที่โฟลเดอร์ `/dist`
3. เข้าสู่เว็บ [Netlify Drop](https://app.netlify.com/drop) แล้วลากโฟลเดอร์ `dist` (หรือ ZIP เฉพาะโฟลเดอร์ `dist` นี้) ไปโยนใส่ในวงจุดไข่ปลาเพื่อรับลิงก์ Deploy ได้ทันที!

---

## 📁 โครงสร้างโปรเจกต์ที่ได้รับการปรับแต่ง
* `src/firebase-applet-config.json` และ `src/firebase.ts`: บันทึกและเรียกใช้ Firebase credentials โดยจะถูก Compile อย่างปลอดภัยเข้าสู่เว็บในเฟส Production
* `netlify.toml`: หน้ากากควบคุม Netlify สำหรับการตั้งค่า dynamic redirection rules ป้องกันหน้าเว็บเกิด 404/Not Found ในกรณีรีเฟรชหน้าจอเว็บ (SPA Route mapping)

---

Developed and optimized for **Maplewood Elementary Scholastic Center**. 🏆
