// progress bar ui
let box1 = document.querySelector(".box-1");
let box2 = document.querySelector(".box-2");
let nextBtn = document.querySelector("#teamDetails");
let backBtn = document.querySelector("#back");
let progressbar = document.querySelector(".bar");
let progresstxt = document.querySelector(".progress #second");
let section1 = document.querySelector(".section-1");
let section2 = document.querySelector(".section-2");
let section3 = document.querySelector(".section-3");
let section4 = document.querySelector(".section-4");
let section5 = document.querySelector(".section-5");
let addMemeberSection = document.querySelector(".add-member")
let mainForm = document.querySelector(".main-form");

nextBtn.addEventListener("click", () => {
  let boxImage = document.querySelector(".box-1 img");
  let boxSpan = document.querySelector(".box-1 span");
  let content = document.querySelector(".content");

  boxSpan.classList.add("unactivediv");
  boxImage.classList.remove("unactivediv");
  box1.style.backgroundColor = "#438C34";
  box2.style.opacity = "1";
  progressbar.style.opacity = "1";
  progresstxt.style.opacity = "1";
  content.style.width = "auto";
  content.style.height = "auto";

  section1.classList.add("unactivediv");
  section2.classList.add("unactivediv");
  section3.classList.add("unactivediv");
  section4.classList.remove("unactivediv");
  section5.classList.remove("unactivediv");
  addMemeberSection.classList.remove("unactivediv");

//   const mainFromStyles = `
//     .main-form {
//     overflow-y: auto;

//     scrollbar-width: thin;
//     scrollbar-color: #888 #1c1626;
//     }
//     .main-form::-webkit-scrollbar {
//     width: 8px;
//     }

//     .main-form::-webkit-scrollbar-thumb {
//     background: #888;
//     border-radius: 10px;
//     }

//     .main-form::-webkit-scrollbar-thumb:hover {
//     background: #aaa;
//     }

// `;

//   const mainFormStyleTag = document.createElement("style");
//   mainFormStyleTag.textContent = mainFromStyles;
//   document.head.appendChild(mainFormStyleTag);
});

backBtn.addEventListener("click", ()=>{
    let boxImage = document.querySelector(".box-1 img");
  let boxSpan = document.querySelector(".box-1 span");
  let content = document.querySelector(".content");

  boxSpan.classList.remove("unactivediv");
  boxImage.classList.add("unactivediv");
  box1.style.backgroundColor = "#f2e9dc";
  box2.style.opacity = "0.3";
  progressbar.style.opacity = "0.3";
  progresstxt.style.opacity = "0.3";
  content.style.width = "100%";
  content.style.height = "100%";

  section1.classList.remove("unactivediv");
  section2.classList.remove("unactivediv");
  section3.classList.remove("unactivediv");
  section4.classList.add("unactivediv");
  section5.classList.add("unactivediv");
  addMemeberSection.classList.add("unactivediv");
})