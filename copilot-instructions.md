# Copilot Instructions for Our Project

These instructions are intended to guide GitHub Copilot (and other AI coding assistants) to help us build high-quality, visually appealing, and secure software that aligns with our project's goals.

## 1. User Interface (UI) and User Experience (UX) Design

*   **Inspiration:** We aim for a modern, clean, and user-centric UI, drawing inspiration from the aesthetics and usability of sites like `bolt.new` and `loveable.dev`.
*   **Key Principles:**
    *   **Clarity & Simplicity:** Interfaces should be intuitive and easy to understand. Avoid clutter.
    *   **Visual Hierarchy:** Use typography, spacing, and color effectively to guide the user's attention to the most important elements.
    *   **Generous Spacing:** Ensure elements have enough room to breathe. Don't cram things together.
    *   **Modern Typography:** Choose clean, legible fonts. Ensure good contrast for readability.
    *   **Subtle & Purposeful Animations:** Animations and transitions should enhance the user experience, provide feedback, and not be distracting.
    *   **Responsiveness:** Ensure UI components are designed to be responsive and adapt gracefully to different screen sizes.
    *   **Accessibility (a11y):** Design with accessibility in mind from the start. Consider keyboard navigation, ARIA attributes where appropriate, and sufficient color contrast.
*   **Component-Based Design:** When creating new UI, think in terms of reusable components. If using a specific UI framework (e.g., Tailwind CSS, Material UI, etc. - *Developer: please specify if applicable*), adhere to its conventions and best practices.
*   **Proactive Suggestions:** You are encouraged to suggest new UI elements or features that align with these design principles and could improve the user experience.

## 2. Task Adherence and Proactivity

*   **Understand the Goal:** Before writing code, ensure you understand the specific task or feature request. If the request is ambiguous, ask for clarification (though as an AI, you might state your assumptions if direct clarification isn't possible).
*   **Core Task First:** Prioritize completing the primary requirements of the task.
*   **Valuable Suggestions:** We welcome suggestions for improvements, new UI elements, or features, as mentioned in the UI/UX section. When suggesting, briefly explain the rationale and how it aligns with our design principles or improves functionality.
*   **Stay Focused:** While proactivity is encouraged, ensure suggestions are relevant to the current context or the overall project goals.

## 3. Safe and High-Quality Coding Practices

*   **Adhere to Current Standards:** All code should follow current (e.g., 2024-2025) standard coding practices, emphasizing security, robustness, and maintainability.
*   **Security First:**
    *   **Input Validation:** Rigorously validate all user inputs and data from external sources to prevent common vulnerabilities (e.g., XSS, SQL Injection, command injection, etc., as applicable to the language and frameworks being used).
    *   **Output Encoding:** Properly encode data when rendering it in UIs or including it in other outputs to prevent XSS.
    *   **Error Handling:** Implement robust error handling. Don't expose sensitive information in error messages. Log errors appropriately.
    *   **Authentication & Authorization:** If working on features related to user authentication or authorization, ensure best practices are followed (e.g., secure password storage, proper session management, principle of least privilege). *(Developer: Specify any auth libraries/methods used).*
    *   **Dependency Management:** Be mindful of the security of third-party libraries and dependencies. *(Developer: Specify if there's a process for vetting dependencies).*
*   **Code Quality & Maintainability:**
    *   **Readability:** Write clear, concise, and well-commented code where necessary. Complex logic should be explained.
    *   **Modularity:** Break down complex logic into smaller, manageable functions or modules.
    *   **DRY (Don't Repeat Yourself):** Avoid code duplication. Utilize functions, classes, and components to promote reusability.
    *   **Language & Framework Idioms:** Write idiomatic code for the programming language and frameworks being used.
    *   **Performance:** Be mindful of performance implications, especially in critical code paths or when dealing with large datasets.
    *   **Testing:**
        *   Write unit tests for new functions and components where appropriate.
        *   Consider edge cases and potential failure modes in your tests.
        *   *(Developer: Specify testing frameworks or expected coverage levels if any).*
*   **Version Control:** Follow standard Git practices. *(Developer: Specify branching strategy or commit message conventions if any).*

## 4. Project-Specific Context

*(Developer: Add any other project-specific instructions, libraries, frameworks, tools, or architectural patterns that Copilot should be aware of. For example:*
*   *Primary programming languages: [e.g., Python, TypeScript, JavaScript]*
*   *Backend framework: [e.g., Flask, Django, Node.js/Express]*
*   *Frontend framework/library: [e.g., React, Vue, Angular, Svelte]*
*   *UI Component Library: [e.g., Tailwind CSS, Material-UI, Bootstrap, Shadcn/ui]*
*   *State Management: [e.g., Redux, Zustand, Context API]*
*   *Database: [e.g., PostgreSQL, MySQL, MongoDB]*
*   *Key architectural patterns: [e.g., MVC, Microservices, RESTful APIs]*)

---

By following these guidelines, you will help us create an exceptional product. We appreciate your assistance!
