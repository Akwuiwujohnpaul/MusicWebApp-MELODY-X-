const tabs = document.querySelectorAll(".tab");
const passwordInput = document.querySelector('input[type="password"]');
const togglePassword = document.querySelector(".togglePassword");
const form = document.querySelector(".authForm");
const loginButton = document.querySelector(".loginBtn");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((btn) => btn.classList.remove("active"));

    tab.classList.add("active");

    if (tab.textContent.trim() === "Register") {
      document.querySelector(".authForm h2").innerHTML =
        "Create <span>Account</span>";

      document.querySelector(".subtitle").textContent =
        "Create an account to start listening.";

      loginButton.textContent = "Register";
    } else {
      document.querySelector(".authForm h2").innerHTML =
        "Welcome <span>Back</span>";

      document.querySelector(".subtitle").textContent =
        "Login to continue to MelodyX";

      loginButton.textContent = "Login";
    }
  });
});

// SHOW / HIDE PASSWORD

togglePassword.addEventListener("click", () => {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";

    togglePassword.classList.remove("fa-eye");

    togglePassword.classList.add("fa-eye-slash");
  } else {
    passwordInput.type = "password";

    togglePassword.classList.remove("fa-eye-slash");

    togglePassword.classList.add("fa-eye");
  }
});

// INPUT ANIMATION

document.querySelectorAll(".inputField input").forEach((input) => {
  input.addEventListener("focus", () => {
    input.parentElement.style.transform = "scale(1.03)";
  });

  input.addEventListener("blur", () => {
    input.parentElement.style.transform = "scale(1.03)";
  });
});

// FORM SUBMIT

form.addEventListener("submit", (e) => {
  // e.preventDefault();

  const inputs = form.querySelectorAll("input");

  let valid = true;

  inputs.forEach((input) => {
    if (input.type !== "checkbox" && input.value.trim() === "") {
      valid = false;

      input.parentElement.style.borderColor = "#ff4b6e";
    } else if (input.type !== "checkbox") {
      input.parentElement.style.borderColor = "#8a2be2";
    }
  });

  if (!valid) {
    alert("Please fill in all required fields.");
    return;
  }

  loginButton.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin"></i> Please wait...';

  loginButton.disabled = true;

  setTimeout(() => {
    alert("Login Successful!");

    window.location.href = "index.html";
  }, 1800);
});
