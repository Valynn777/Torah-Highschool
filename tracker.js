const LESSON_GROUPS = [
  {
    id: "foundations",
    title: "Foundations",
    subtitle: "Orientation and Scripture framework",
    lessons: [
      {
        id: "foundations",
        day: "Prep",
        title: "Foundations",
        reading: "Torah · Tanakh · New Testament Writings",
        href: "lesson-.5-foundations_lesson_torah_tanakh_nt.html"
      }
    ]
  },
  {
    id: "week-1",
    title: "Week 1",
    subtitle: "Genesis 1–25",
    lessons: [
      { id: "lesson-1", day: "Day 1", title: "Genesis 1–5", reading: "Creation to Seth's line", href: "lesson-1-genesis-1-4_lesson_template_updated.html" },
      { id: "lesson-2", day: "Day 2", title: "Genesis 6–10", reading: "Noah, flood, covenant, nations", href: "lesson-2-genesis-6-10_lesson_template_updated.html" },
      { id: "lesson-3", day: "Day 3", title: "Genesis 11–15", reading: "Babel, Abram, covenant promise", href: "lesson-3-genesis-11-15_lesson_template_updated.html" },
      { id: "lesson-4", day: "Day 4", title: "Genesis 16–20", reading: "Waiting, covenant sign, intercession", href: "lesson-4-genesis-16-20_lesson_template_updated.html" },
      { id: "lesson-5", day: "Day 5", title: "Genesis 21–25", reading: "Isaac, testing, provision", href: "lesson-5-genesis-21-25_lesson_template_updated.html" }
    ]
  },
  {
    id: "week-2",
    title: "Week 2",
    subtitle: "Genesis 26–50",
    lessons: [
      { id: "lesson-6", day: "Day 1", title: "Genesis 26–30", reading: "Isaac, Jacob, Bethel, household growth", href: "lesson-6-genesis-26-30_lesson_template_updated.html" },
      { id: "lesson-7", day: "Day 2", title: "Genesis 31–35", reading: "Return, wrestling, Bethel, Israel", href: "lesson-7-genesis-31-35_lesson_template_updated.html" },
      { id: "lesson-8", day: "Day 3", title: "Genesis 36–40", reading: "Joseph's early years in Egypt", href: "lesson-8-genesis-36-40_lesson_template_updated.html" },
      { id: "lesson-9", day: "Day 4", title: "Genesis 41–45", reading: "Wisdom, famine, reconciliation", href: "lesson-9-genesis-41-45_lesson_template_updated.html" },
      { id: "lesson-10", day: "Day 5", title: "Genesis 46–50", reading: "Blessing, forgiveness, providence", href: "lesson-10-genesis-46-50_lesson_template_updated.html" }
    ]
  }
];

const DEFAULT_LESSONS_PER_WEEK = 5;

function getStudentConfig() {
  const body = document.body;
  return {
    key: body.dataset.studentKey,
    label: body.dataset.studentLabel || "Student"
  };
}

function getStorageKey(studentKey) {
  return `torah-tracker:${studentKey}:progress`;
}

function getPaceKey(studentKey) {
  return `torah-tracker:${studentKey}:pace`;
}

function flattenLessons() {
  return LESSON_GROUPS.flatMap(group =>
    group.lessons.map(lesson => ({
      ...lesson,
      groupId: group.id,
      groupTitle: group.title
    }))
  );
}

function loadProgress(studentKey) {
  try {
    return JSON.parse(localStorage.getItem(getStorageKey(studentKey))) || {};
  } catch {
    return {};
  }
}

function saveProgress(studentKey, progress) {
  localStorage.setItem(getStorageKey(studentKey), JSON.stringify(progress));
}

function loadPace(studentKey) {
  const value = Number(localStorage.getItem(getPaceKey(studentKey)));
  return value > 0 ? value : DEFAULT_LESSONS_PER_WEEK;
}

function savePace(studentKey, pace) {
  localStorage.setItem(getPaceKey(studentKey), String(pace));
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function projectCompletionDate(remaining, pacePerWeek) {
  if (remaining <= 0) return "Complete";
  if (!pacePerWeek || pacePerWeek < 1) return "Set weekly pace";
  const daysNeeded = Math.ceil((remaining / pacePerWeek) * 7);
  const projected = new Date();
  projected.setDate(projected.getDate() + daysNeeded);
  return formatDate(projected);
}

function buildStudentPage() {
  if (!document.body.classList.contains("student-page")) return;

  const student = getStudentConfig();
  const title = document.getElementById("studentTitle");
  const weeksMount = document.getElementById("weeksMount");
  const jumpToNextBtn = document.getElementById("jumpToNextBtn");
  const resetProgressBtn = document.getElementById("resetProgressBtn");
  const paceInput = document.getElementById("paceInput");
  const allLessons = flattenLessons();

  title.textContent = student.label;
  paceInput.value = loadPace(student.key);

  function render() {
    const progress = loadProgress(student.key);
    const pace = loadPace(student.key);
    const completedCount = allLessons.filter(lesson => progress[lesson.id]).length;
    const remainingCount = allLessons.length - completedCount;
    const nextLesson = allLessons.find(lesson => !progress[lesson.id]) || null;

    document.getElementById("progressNumbers").textContent = `${completedCount} / ${allLessons.length} completed`;
    document.getElementById("completedCount").textContent = `${completedCount} completed`;
    document.getElementById("remainingCount").textContent = `${remainingCount} remaining`;
    document.getElementById("projectedDate").textContent = `Projected completion: ${projectCompletionDate(remainingCount, pace)}`;
    document.getElementById("progressFill").style.width = `${(completedCount / allLessons.length) * 100}%`;
    document.getElementById("nextLessonText").textContent = nextLesson
      ? `Next lesson: ${nextLesson.groupTitle} · ${nextLesson.day} · ${nextLesson.title}`
      : "Everything currently listed is complete for this student.";

    weeksMount.innerHTML = "";

    LESSON_GROUPS.forEach((group, index) => {
      const groupCompleted = group.lessons.filter(lesson => progress[lesson.id]).length;
      const card = document.createElement("section");
      card.className = "card week-card";

      const header = document.createElement("div");
      header.className = "week-header";

      const titleWrap = document.createElement("div");
      titleWrap.className = "week-title-wrap";
      titleWrap.innerHTML = `
        <h2>${group.title}</h2>
        <p>${group.subtitle}</p>
      `;

      const weekSummary = document.createElement("div");
      weekSummary.className = "week-summary";
      weekSummary.textContent = `${groupCompleted} / ${group.lessons.length} complete`;

      const toggle = document.createElement("button");
      toggle.className = "week-toggle";
      toggle.type = "button";
      toggle.textContent = index === 0 ? "Hide Lessons" : "Show Lessons";

      header.appendChild(titleWrap);
      header.appendChild(weekSummary);
      header.appendChild(toggle);

      const body = document.createElement("div");
      body.className = "week-body";
      if (index !== 0) {
        card.classList.add("is-collapsed");
      }

      group.lessons.forEach(lesson => {
        const completed = !!progress[lesson.id];
        const lessonRow = document.createElement("article");
        lessonRow.className = "lesson-row";
        if (completed) lessonRow.classList.add("completed");
        if (nextLesson && nextLesson.id === lesson.id) lessonRow.classList.add("next-up");
        lessonRow.id = `row-${lesson.id}`;

        const day = document.createElement("div");
        day.className = "lesson-day";
        day.textContent = lesson.day;

        const content = document.createElement("div");
        const nextBadge = nextLesson && nextLesson.id === lesson.id ? `<span class="status-badge">Next</span>` : "";
        content.innerHTML = `
          <h3 class="lesson-title">${lesson.title}${nextBadge}</h3>
          <p class="lesson-meta">${lesson.reading}</p>
        `;

        const actions = document.createElement("div");
        actions.className = "lesson-actions";

        const openLink = document.createElement("a");
        openLink.className = "lesson-link";
        openLink.href = lesson.href;
        openLink.textContent = "Open Lesson";

        const completeToggle = document.createElement("button");
        completeToggle.className = "complete-toggle";
        completeToggle.type = "button";
        completeToggle.textContent = completed ? "Completed" : "Mark Complete";
        completeToggle.addEventListener("click", () => {
          const nextProgress = loadProgress(student.key);
          nextProgress[lesson.id] = !nextProgress[lesson.id];
          saveProgress(student.key, nextProgress);
          render();
        });

        actions.appendChild(openLink);
        actions.appendChild(completeToggle);

        lessonRow.appendChild(day);
        lessonRow.appendChild(content);
        lessonRow.appendChild(actions);
        body.appendChild(lessonRow);
      });

      toggle.addEventListener("click", () => {
        card.classList.toggle("is-collapsed");
        toggle.textContent = card.classList.contains("is-collapsed") ? "Show Lessons" : "Hide Lessons";
      });

      card.appendChild(header);
      card.appendChild(body);
      weeksMount.appendChild(card);
    });

    jumpToNextBtn.disabled = !nextLesson;
    jumpToNextBtn.onclick = () => {
      if (!nextLesson) return;
      const row = document.getElementById(`row-${nextLesson.id}`);
      row?.scrollIntoView({ behavior: "smooth", block: "center" });
    };
  }

  paceInput.addEventListener("change", () => {
    const nextValue = Math.max(1, Math.min(14, Number(paceInput.value) || DEFAULT_LESSONS_PER_WEEK));
    paceInput.value = nextValue;
    savePace(student.key, nextValue);
    render();
  });

  resetProgressBtn.addEventListener("click", () => {
    const confirmed = window.confirm(`Reset all saved progress for ${student.label}?`);
    if (!confirmed) return;
    saveProgress(student.key, {});
    render();
  });

  render();
}

buildStudentPage();
