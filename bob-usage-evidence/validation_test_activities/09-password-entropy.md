# Computer Science: Password Entropy and Security Through Computational Thinking

## Narrative Hook

A hacker has a computer that can try 1 billion passwords per second. Your password is eight letters long, all lowercase. How long would it take to crack it? Your friend's password has uppercase, lowercase, numbers, and symbols — same length. How much longer? The answer surprises most people: making one password is the difference between five seconds and 200 years.

---

## Timeline

| Phase | Activity | Time |
|-------|----------|------|
| 1 | Hook & estimation challenge | 10 min |
| 2 | Combinatorics mini-lesson | 15 min |
| 3 | Python calculation activity | 20 min |
| 4 | Comparing entropy across passwords | 15 min |
| 5 | Real-world application & reflection | 10 min |
| **Total** | | **70 min** |

---

## Materials

- Computer lab with Python 3 installed (one machine per student or per pair)
- Sample code file (pre-written Python script skeleton, see Step 3)
- Whiteboard or projector for live coding demo
- Journals or reflection sheets
- Optional: printed quick-reference guide to the entropy formula: Entropy (bits) = log₂(number of possible characters)^(password length)

---

## Step-by-Step Instructions

1. **Phase 1 — Hook & Estimation Challenge (10 min)**
   - Read the hook aloud. Write two scenarios on the board:
     - Password A: 8 lowercase letters (a–z)
     - Password B: 8 mixed case + numbers + symbols (a–z, A–Z, 0–9, +!@#$%)
   - Ask: "Raise your hand if you think Password B would take 10× longer to crack. 100× longer. 1,000× longer?"
   - Record guesses. Do not reveal the answer yet.
   - Explain: "The answer is hidden in something called entropy — a measure of how many possibilities there are. The more possibilities, the longer to crack. Today, you'll calculate it yourself."

2. **Phase 2 — Combinatorics Mini-Lesson (15 min)**
   - On the board, work through a simple example together:
     - A one-character password with 26 letters (a–z): 26 possibilities
     - A two-character password with 26 letters: 26 × 26 = 676 possibilities
     - An eight-character password with 26 letters: 26^8 = ?
   - Have students estimate 26^8 before calculating. Write the actual number on the board: 208,827,064,576 (about 209 billion).
   - Now do the mixed-case version:
     - Character set size: lowercase (26) + uppercase (26) + digits (10) + symbols (let's say 10) = 72 possible characters
     - Eight-character password: 72^8 = ?
   - Calculate together: approximately 722 trillion.
   - Ask: "If a computer tries 1 billion passwords per second, how many seconds does each take?" (Use simple division: total possibilities ÷ 1 billion ÷ seconds-in-an-hour ÷ hours-in-a-year)
   - Build a table on the board showing: character set, password length, total possibilities, and cracking time in years.

3. **Phase 3 — Python Calculation Activity (20 min)**
   - Each student opens a Python IDE (or a shared classroom Python environment like repl.it or Trinket).
   - Provide (or co-write) a script skeleton:
   ```python
   # Password Entropy Calculator
   
   def calculate_possibilities(charset_size, password_length):
       return charset_size ** password_length
   
   def cracking_time_seconds(possibilities, attempts_per_sec=1e9):
       # Assumes average: halfway through possibilities
       return possibilities / 2 / attempts_per_sec
   
   # Define character sets
   lowercase = 26
   uppercase = 26
   digits = 10
   symbols = 10
   
   # Calculate for different passwords
   charset_all = lowercase + uppercase + digits + symbols  # 72
   passwd_len = 8
   
   poss = calculate_possibilities(charset_all, passwd_len)
   time_sec = cracking_time_seconds(poss)
   time_years = time_sec / (365.25 * 24 * 3600)
   
   print(f"Character set size: {charset_all}")
   print(f"Password length: {passwd_len}")
   print(f"Possibilities: {poss:,}")
   print(f"Time to crack (average): {time_years:,.1f} years")
   ```
   - Students run the code and compare the output to their earlier guesses. Calculate the same for 8 lowercase letters only.
   - Ask: "By changing what, does entropy change most — password length or character set size?" (Guide toward: both matter, but length is exponential.)
   - Extension: Have students modify the code to compare passwords of different lengths (8, 10, 12 characters) and record the trend.

4. **Phase 4 — Comparing Entropy Across Passwords (15 min)**
   - Display or project a list of real-world password examples:
     - "password" (8 letters, lowercase)
     - "MyDogSpot" (9 letters, mixed case)
     - "MyDogSpot2024" (13 characters, mixed case + digits)
     - "MyDogSpot@2024!" (15 characters, mixed case + digits + symbols)
   - Students calculate the entropy and cracking time for each using their Python script (or by hand using the table from Phase 2).
   - Create a class chart: Password → Entropy → Cracking Time.
   - Ask: "Which password is strongest? Which is easiest to remember? Is there a trade-off?" (Yes — longer, more complex passwords are harder to remember.)
   - Introduce the idea of passphases: "MyDog Spot At Seven" (using spaces and natural language instead of symbols). Calculate its entropy compared to "MyDogSpot@2024!".

5. **Phase 5 — Real-World Application & Reflection (10 min)**
   - Pose the real-world question: "Your email is worth a lot to a hacker — it controls password resets, bank accounts, your digital life. How long should your password be and how complex?" (Guide toward: very long and complex, or a very strong passphrase.)
   - Discuss: "Why don't websites just require very complex passwords? Why do some limit length?" (Answer: balancing security with usability; some legacy systems have limitations.)
   - Students complete their reflection (see below).

---

## Reflection Questions

1. Before this activity, did you think password length or character variety mattered more for security? How has your thinking changed?
2. A website says, "Your password must be at least 8 characters." Based on entropy, is that enough? What would you recommend instead?
3. Could you remember a 20-character random password? How do real people balance security and memory?
4. A hacker says, "I'll crack your password in a year." Should you be worried? Why or why not?
5. Explain entropy to someone who's never heard of it. Use an example that's not about passwords.

---

## Assessment Rubric

| Criterion | Developing (1) | Proficient (2) | Advanced (3) |
|-----------|----------------|----------------|-------------|
| **Understanding of exponential growth** | Cannot explain why password length matters; treats it as linear | Understands that length increases possibilities but may not articulate the exponential nature | Clearly explains exponential growth (2^length) and can compare the impact of length vs. character set size |
| **Computational application** | Makes errors in Python syntax or logic; code doesn't run or produces wrong values | Code runs and produces correct calculations for one or two password examples | Code is accurate, modular, and student can modify it to test new hypotheses |
| **Analysis & interpretation** | Cannot interpret what cracking time means; misses the security implication | Interprets cracking time in years but struggles to draw conclusions about password strength | Accurately interprets cracking time, compares multiple passwords, and makes informed recommendations about security trade-offs |
| **Real-world reasoning** | Reflection is surface-level or detached from practical security | Reflection connects entropy to password choice but misses nuance (e.g., usability trade-offs) | Reflection demonstrates sophisticated thinking about security, usability, memory, and the real threats users face |

---

## Customization Zones

**Swap the programming language** — the activity works in JavaScript, Java, or any language with exponentiation. Pseudocode or a spreadsheet (LibreOffice Calc) can also work if a full programming lab isn't available.
📝 [INSERT STUDENT WORKSHEET HERE] — Spreadsheet template with formulas pre-built for entropy calculation

**Make it more mathematical** — introduce the formal entropy formula: Entropy (bits) = log₂(charset_size^length). Have students calculate and compare bits of entropy for different passwords. Connect to information theory.
✏️ [INSERT TEACHER NOTE HERE] — This is a strong extension for STEM or advanced students.

**Connect to real data breaches** — research a public data breach (many are documented publicly, e.g., LinkedIn 2012 breach). Show students what a real list of cracked passwords looks like. Ask: "Why do most people choose weak passwords if they know better?" (Habits, frustration, not realising the risk.)
📷 [INSERT PHOTO OR IMAGE HERE] — A visualisation or graph of common passwords from public breach data

**Two-factor authentication** — after entropy, introduce the concept of 2FA: "Even if your password is weak, your account is protected if you also need your phone." Have students research how 2FA changes the calculus of cracking accounts.
✏️ [INSERT TEACHER NOTE HERE]
