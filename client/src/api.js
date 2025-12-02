// src/api.js

const GATEWAY = "http://localhost:9000";

/************ POLLING ************/
export async function pollTask(task_id) {
  while (true) {
    const res = await fetch(`${GATEWAY}/task/${task_id}`);
    const data = await res.json();

    // 1. Stop if Celery finished
    if (data.status === "SUCCESS" || data.status === "FAILURE") {
      return data;
    }

    // 2. Stop if Celery returns weird empty result (prevents infinite loop)
    if (data.result === null || typeof data.result === "undefined") {
      return data;
    }

    // 3. Sleep and continue polling
    await new Promise((r) => setTimeout(r, 500));
  }
}



/************ SIGNUP ************/
export async function signup(name, email, password) {
  const fd = new FormData();
  fd.append("name", name);
  fd.append("email", email);
  fd.append("password", password);

  const res = await fetch(`${GATEWAY}/signup`, { method: "POST", body: fd });
  return await res.json(); // {task_id}
}

/************ VERIFY OTP ************/
export async function verifyOtp(email, code) {
  const fd = new FormData();
  fd.append("email", email);
  fd.append("code", code);

  const res = await fetch(`${GATEWAY}/verify`, { method: "POST", body: fd });
  return await res.json(); // {task_id} or error
}

/************ LOGIN ************/
export async function login(email, password) {
  const fd = new FormData();
  fd.append("email", email);
  fd.append("password", password);

  const res = await fetch(`${GATEWAY}/login`, { method: "POST", body: fd });
  return await res.json(); // {task_id}
}

/************ TRAIT PREDICT ************/
export async function traitPredict(file, username) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("username", username);

  const res = await fetch(`${GATEWAY}/trait-predict`, { method: "POST", body: fd });
  return await res.json(); // {task_id}
}
