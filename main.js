import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import MarkdownIt from "markdown-it";

// 🔥 API Key (Ganti dengan kunci API Anda di lingkungan aman)
const API_KEY = "AIzaSyBlW1QdgkhtIwGxO4bHRUjCqZVhB48xd9g";

// Elemen yang digunakan dalam formulir
const form = document.querySelector("#student-form");
const output = document.querySelector(".output");

form.onsubmit = async (event) => {
  event.preventDefault();
  output.textContent = "Generating...";

  // Ambil data input dari form
  const name = form.elements["name"].value;
  const interests = form.elements["interests"].value;
  const math = form.elements["math"].value;
  const science = form.elements["science"].value;
  const language = form.elements["language"].value;
  const personality = form.elements["personality"].value;

  // Rangkai data menjadi satu prompt
  const prompt = `Rekomendasikan jurusan siswa berdasarkan parameter berikut:
    - Nama Lengkap: ${name}
    - Minat Utama: ${interests}
    - Nilai: Matematika = ${math}, IPA = ${science}, Bahasa = ${language}
    - Kepribadian: ${personality}`;

  try {
    // Struktur konten untuk API Gemini
    const contents = [
      {
        role: "user",
        parts: [
          { text: prompt } // Hanya mengirim teks, tidak ada gambar
        ]
      }
    ];

    // Panggil API Gemini
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    const result = await model.generateContentStream({ contents });

    // Render hasil menggunakan MarkdownIt
    const buffer = [];
    const md = new MarkdownIt();
    for await (const response of result.stream) {
      buffer.push(response.text());
      output.innerHTML = md.render(buffer.join(""));
    }
  } catch (error) {
    console.error(error);
    output.innerHTML = `<hr>Terjadi kesalahan: ${error.message}`;
  }
};