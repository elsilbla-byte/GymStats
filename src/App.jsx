import { useEffect, useState } from "react";
import "./App.css";

const categories = [
  "General",
  "Suelo",
  "Barra",
  "Barra de equilibrio",
  "Salto",
];

function App() {
  const [section, setSection] = useState("inicio");
  const [menuOpen, setMenuOpen] = useState(false);

  // =========================
  // OBJETIVOS
  // =========================

  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem("gymstats_goals");

      if (!saved) return [];

      const parsed = JSON.parse(saved);

      if (!Array.isArray(parsed)) return [];

      return parsed.map((goal) => ({
        ...goal,
        category: goal.category || "General",
        completed: Boolean(goal.completed),
        progress: Number(goal.progress) || 0,
      }));
    } catch {
      return [];
    }
  });

  // =========================
  // RÉCORDS
  // =========================

  const [records, setRecords] = useState(() => {
    try {
      const saved = localStorage.getItem("gymstats_records");

      if (!saved) return [];

      const parsed = JSON.parse(saved);

      if (!Array.isArray(parsed)) return [];

      return parsed.map((record) => ({
        ...record,
        category: record.category || "General",
        completed: Boolean(record.completed),
        history: Array.isArray(record.history)
          ? record.history
          : [
              {
                value: record.value || "",
                date: record.date || "",
              },
            ],
      }));
    } catch {
      return [];
    }
  });

  // =========================
  // ESTADOS DE FORMULARIOS
  // =========================

  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editingRecordId, setEditingRecordId] = useState(null);

  const [goalForm, setGoalForm] = useState({
    name: "",
    description: "",
    progress: 0,
    category: "General",
  });

  const [recordForm, setRecordForm] = useState({
    name: "",
    value: "",
    unit: "",
    date: "",
    notes: "",
    category: "General",
  });

  const [goalFilter, setGoalFilter] = useState("Todas");
  const [recordFilter, setRecordFilter] = useState("Todas");

  const [expandedRecord, setExpandedRecord] = useState(null);

  // =========================
  // GUARDAR DATOS
  // =========================

  useEffect(() => {
    localStorage.setItem("gymstats_goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem("gymstats_records", JSON.stringify(records));
  }, [records]);

  // =========================
  // NAVEGACIÓN
  // =========================

  const changeSection = (newSection) => {
    setSection(newSection);
    setMenuOpen(false);
  };

  // =========================
  // OBJETIVOS
  // =========================

  const resetGoalForm = () => {
    setGoalForm({
      name: "",
      description: "",
      progress: 0,
      category: "General",
    });

    setEditingGoalId(null);
  };

  const handleGoalSubmit = (event) => {
    event.preventDefault();

    if (!goalForm.name.trim()) return;

    const progress = Math.min(
      100,
      Math.max(0, Number(goalForm.progress) || 0)
    );

    if (editingGoalId) {
      setGoals((currentGoals) =>
        currentGoals.map((goal) =>
          goal.id === editingGoalId
            ? {
                ...goal,
                name: goalForm.name.trim(),
                description: goalForm.description.trim(),
                progress,
                category: goalForm.category,
                completed: progress >= 100 ? true : goal.completed,
              }
            : goal
        )
      );
    } else {
      const newGoal = {
        id: Date.now(),
        name: goalForm.name.trim(),
        description: goalForm.description.trim(),
        progress,
        category: goalForm.category,
        completed: progress >= 100,
      };

      setGoals((currentGoals) => [...currentGoals, newGoal]);
    }

    resetGoalForm();
  };

  const editGoal = (goal) => {
    setEditingGoalId(goal.id);

    setGoalForm({
      name: goal.name,
      description: goal.description || "",
      progress: goal.progress,
      category: goal.category || "General",
    });

    setSection("objetivos");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteGoal = (id) => {
    const confirmed = window.confirm(
      "¿Seguro que quieres eliminar este objetivo?"
    );

    if (!confirmed) return;

    setGoals((currentGoals) =>
      currentGoals.filter((goal) => goal.id !== id)
    );

    if (editingGoalId === id) {
      resetGoalForm();
    }
  };

  const toggleGoalCompleted = (id) => {
    setGoals((currentGoals) =>
      currentGoals.map((goal) => {
        if (goal.id !== id) return goal;

        const completed = !goal.completed;

        return {
          ...goal,
          completed,
          progress: completed ? 100 : Math.min(goal.progress, 99),
        };
      })
    );
  };

  // =========================
  // RÉCORDS
  // =========================

  const resetRecordForm = () => {
    setRecordForm({
      name: "",
      value: "",
      unit: "",
      date: "",
      notes: "",
      category: "General",
    });

    setEditingRecordId(null);
  };

  const handleRecordSubmit = (event) => {
    event.preventDefault();

    if (!recordForm.name.trim() || !recordForm.value.trim()) return;

    if (editingRecordId) {
      setRecords((currentRecords) =>
        currentRecords.map((record) =>
          record.id === editingRecordId
            ? {
                ...record,
                name: recordForm.name.trim(),
                value: recordForm.value.trim(),
                unit: recordForm.unit.trim(),
                date: recordForm.date,
                notes: recordForm.notes.trim(),
                category: recordForm.category,
              }
            : record
        )
      );
    } else {
      const newRecord = {
        id: Date.now(),
        name: recordForm.name.trim(),
        value: recordForm.value.trim(),
        unit: recordForm.unit.trim(),
        date: recordForm.date,
        notes: recordForm.notes.trim(),
        category: recordForm.category,
        completed: false,
        history: [
          {
            value: recordForm.value.trim(),
            date: recordForm.date,
          },
        ],
      };

      setRecords((currentRecords) => [
        ...currentRecords,
        newRecord,
      ]);
    }

    resetRecordForm();
  };

  const editRecord = (record) => {
    setEditingRecordId(record.id);

    setRecordForm({
      name: record.name,
      value: record.value || "",
      unit: record.unit || "",
      date: record.date || "",
      notes: record.notes || "",
      category: record.category || "General",
    });

    setSection("records");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteRecord = (id) => {
    const confirmed = window.confirm(
      "¿Seguro que quieres eliminar este récord?"
    );

    if (!confirmed) return;

    setRecords((currentRecords) =>
      currentRecords.filter((record) => record.id !== id)
    );

    if (editingRecordId === id) {
      resetRecordForm();
    }

    if (expandedRecord === id) {
      setExpandedRecord(null);
    }
  };

  const toggleRecordCompleted = (id) => {
    setRecords((currentRecords) =>
      currentRecords.map((record) =>
        record.id === id
          ? {
              ...record,
              completed: !record.completed,
            }
          : record
      )
    );
  };

  const addRecordHistory = (record) => {
    const newValue = window.prompt(
      `Nueva marca para "${record.name}":`,
      record.value
    );

    if (newValue === null || !newValue.trim()) return;

    const newDate =
      window.prompt(
        "Fecha de esta nueva marca (opcional):",
        new Date().toISOString().split("T")[0]
      ) || "";

    const newHistoryItem = {
      value: newValue.trim(),
      date: newDate,
    };

    setRecords((currentRecords) =>
      currentRecords.map((currentRecord) =>
        currentRecord.id === record.id
          ? {
              ...currentRecord,
              value: newValue.trim(),
              date: newDate,
              history: [
                ...(currentRecord.history || []),
                newHistoryItem,
              ],
            }
          : currentRecord
      )
    );
  };

  // =========================
  // MEJOR MARCA
  // =========================

  const getBestValue = (record) => {
    const values = [
      record.value,
      ...(record.history || []).map((item) => item.value),
    ]
      .map((value) => parseFloat(String(value).replace(",", ".")))
      .filter((value) => !Number.isNaN(value));

    if (values.length === 0) {
      return record.value;
    }

    return Math.max(...values);
  };

  // =========================
  // FILTROS
  // =========================

  const filteredGoals =
    goalFilter === "Todas"
      ? goals
      : goals.filter((goal) => goal.category === goalFilter);

  const filteredRecords =
    recordFilter === "Todas"
      ? records
      : records.filter(
          (record) => record.category === recordFilter
        );

  // =========================
  // ESTADÍSTICAS
  // =========================

  const completedGoals = goals.filter(
    (goal) => goal.completed
  ).length;

  const completedRecords = records.filter(
    (record) => record.completed
  ).length;

  const totalAchievements =
    completedGoals + completedRecords;

  const averageProgress =
    goals.length > 0
      ? Math.round(
          goals.reduce(
            (total, goal) => total + Number(goal.progress || 0),
            0
          ) / goals.length
        )
      : 0;

  const goalCompletionPercentage =
    goals.length > 0
      ? Math.round((completedGoals / goals.length) * 100)
      : 0;

  // =========================
  // PROGRESO POR CATEGORÍA
  // =========================

  const getCategoryProgress = (category) => {
    const categoryGoals = goals.filter(
      (goal) => goal.category === category
    );

    if (categoryGoals.length === 0) return 0;

    return Math.round(
      categoryGoals.reduce(
        (total, goal) => total + Number(goal.progress || 0),
        0
      ) / categoryGoals.length
    );
  };

  // =========================
  // COMPONENTE DE NAVEGACIÓN
  // =========================

  const Navigation = () => (
    <>
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="sidebar-title">NadiaStats</div>

        <button
          className={section === "inicio" ? "nav-item active" : "nav-item"}
          onClick={() => changeSection("inicio")}
        >
          🏠
          <span>Inicio</span>
        </button>

        <button
          className={
            section === "objetivos"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() => changeSection("objetivos")}
        >
          🎯
          <span>Objetivos</span>
        </button>

        <button
          className={
            section === "records"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() => changeSection("records")}
        >
          🏆
          <span>Récords</span>
        </button>
      </aside>

      {menuOpen && (
        <div
          className="menu-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );

  // =========================
  // INICIO
  // =========================

  const renderHome = () => (
    <div className="page">
      <div className="welcome">
        <div>
          <p className="eyebrow">NadiaStats</p>
          <h1>Tu progreso de gimnasia</h1>
          <p>
            Registra tus objetivos y tus récords personales.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">🎯</span>
          <div>
            <span className="stat-label">Objetivos</span>
            <strong>{goals.length}</strong>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">🏆</span>
          <div>
            <span className="stat-label">Récords</span>
            <strong>{records.length}</strong>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">⭐</span>
          <div>
            <span className="stat-label">Logros</span>
            <strong>{totalAchievements}</strong>
          </div>
        </div>
      </div>

      <div className="overall-progress-card">
        <div className="card-heading">
          <div>
            <span className="card-label">
              PROGRESO GENERAL
            </span>
            <h2>{averageProgress}%</h2>
          </div>

          <div className="big-progress-circle">
            {averageProgress}%
          </div>
        </div>

        <div className="progress-bar large">
          <div
            className="progress-fill"
            style={{ width: `${averageProgress}%` }}
          />
        </div>

        <p>
          {goals.length === 0
            ? "Todavía no has creado ningún objetivo."
            : `${completedGoals} de ${goals.length} objetivos completados.`}
        </p>
      </div>

      <div className="category-section">
        <div className="section-header">
          <div>
            <span className="card-label">
              CATEGORÍAS
            </span>
            <h2>Progreso por aparato</h2>
          </div>
        </div>

        <div className="category-grid">
          {categories.map((category) => {
            const progress = getCategoryProgress(category);

            return (
              <div className="category-card" key={category}>
                <div className="category-card-top">
                  <span>{category}</span>
                  <strong>{progress}%</strong>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="home-grid">
        <div className="home-card">
          <div className="section-header">
            <div>
              <span className="card-label">
                OBJETIVOS
              </span>
              <h2>Mis objetivos</h2>
            </div>

            <button
              className="text-button"
              onClick={() => changeSection("objetivos")}
            >
              Ver todos →
            </button>
          </div>

          {goals.length === 0 ? (
            <div className="empty-mini">
              <span>🎯</span>
              <p>No tienes objetivos todavía.</p>
              <button
                className="primary-button small"
                onClick={() => changeSection("objetivos")}
              >
                Crear objetivo
              </button>
            </div>
          ) : (
            goals.slice(0, 3).map((goal) => (
              <div className="mini-goal" key={goal.id}>
                <div className="mini-goal-info">
                  <span className="mini-icon">🎯</span>

                  <div>
                    <strong>{goal.name}</strong>
                    <span>{goal.category}</span>
                  </div>
                </div>

                <div className="mini-progress">
                  <span>{goal.progress}%</span>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${goal.progress}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="home-card">
          <div className="section-header">
            <div>
              <span className="card-label">
                RÉCORDS
              </span>
              <h2>Mis récords</h2>
            </div>

            <button
              className="text-button"
              onClick={() => changeSection("records")}
            >
              Ver todos →
            </button>
          </div>

          {records.length === 0 ? (
            <div className="empty-mini">
              <span>🏆</span>
              <p>No tienes récords todavía.</p>
              <button
                className="primary-button small"
                onClick={() => changeSection("records")}
              >
                Crear récord
              </button>
            </div>
          ) : (
            records.slice(0, 3).map((record) => (
              <div className="mini-record" key={record.id}>
                <span className="mini-icon">🏆</span>

                <div>
                  <strong>{record.name}</strong>
                  <span>{record.category}</span>
                </div>

                <b>
                  {record.value} {record.unit}
                </b>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="achievements-card">
        <div>
          <span className="card-label">
            LOGROS COMPLETADOS
          </span>
          <h2>{totalAchievements}</h2>
          <p>
            {totalAchievements === 0
              ? "Empieza creando tus primeros objetivos y récords."
              : "¡Sigue registrando tus progresos!"}
          </p>
        </div>

        <div className="achievement-icon">🏅</div>
      </div>
    </div>
  );

  // =========================
  // OBJETIVOS
  // =========================

  const renderGoals = () => (
    <div className="page">
      <div className="section-header main-header">
        <div>
          <span className="card-label">NadiaStats</span>
          <h1>Objetivos</h1>
          <p>
            Crea y controla los objetivos que quieras conseguir.
          </p>
        </div>
      </div>

      <form className="form-card" onSubmit={handleGoalSubmit}>
        <div className="form-card-header">
          <div>
            <span className="form-icon">🎯</span>
            <div>
              <h2>
                {editingGoalId
                  ? "Editar objetivo"
                  : "Nuevo objetivo"}
              </h2>
              <p>
                {editingGoalId
                  ? "Modifica los datos del objetivo."
                  : "Añade un nuevo objetivo personal."}
              </p>
            </div>
          </div>

          {editingGoalId && (
            <button
              type="button"
              className="secondary-button"
              onClick={resetGoalForm}
            >
              Cancelar
            </button>
          )}
        </div>

        <div className="form-row">
          <label>
            Nombre del objetivo
            <input
              type="text"
              placeholder="Ej. Parada de manos"
              value={goalForm.name}
              onChange={(event) =>
                setGoalForm({
                  ...goalForm,
                  name: event.target.value,
                })
              }
              required
            />
          </label>

          <label>
            Categoría
            <select
              value={goalForm.category}
              onChange={(event) =>
                setGoalForm({
                  ...goalForm,
                  category: event.target.value,
                })
              }
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Descripción
          <textarea
            placeholder="Describe lo que quieres conseguir..."
            value={goalForm.description}
            onChange={(event) =>
              setGoalForm({
                ...goalForm,
                description: event.target.value,
              })
            }
            rows="3"
          />
        </label>

        <label>
          Progreso: <strong>{goalForm.progress}%</strong>
          <input
            type="range"
            min="0"
            max="100"
            value={goalForm.progress}
            onChange={(event) =>
              setGoalForm({
                ...goalForm,
                progress: event.target.value,
              })
            }
          />
        </label>

        <button className="primary-button" type="submit">
          {editingGoalId
            ? "Guardar cambios"
            : "Crear objetivo"}
        </button>
      </form>

      <div className="filter-bar">
        <div>
          <span className="card-label">FILTRAR</span>
          <h2>Mis objetivos</h2>
        </div>

        <div className="filter-buttons">
          <button
            className={
              goalFilter === "Todas"
                ? "filter-button active"
                : "filter-button"
            }
            onClick={() => setGoalFilter("Todas")}
          >
            Todas
          </button>

          {categories.map((category) => (
            <button
              key={category}
              className={
                goalFilter === category
                  ? "filter-button active"
                  : "filter-button"
              }
              onClick={() => setGoalFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {filteredGoals.length === 0 ? (
        <div className="empty-card">
          <div>🎯</div>
          <h2>
            {goals.length === 0
              ? "Todavía no tienes objetivos"
              : "No hay objetivos en esta categoría"}
          </h2>
          <p>
            {goals.length === 0
              ? "Crea tu primer objetivo usando el formulario de arriba."
              : "Prueba a seleccionar otra categoría."}
          </p>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredGoals.map((goal) => (
            <article
              className={
                goal.completed
                  ? "goal-card completed"
                  : "goal-card"
              }
              key={goal.id}
            >
              <div className="card-top">
                <span className="card-icon">🎯</span>

                <div className="card-badges">
                  {goal.completed && (
                    <span className="completed-badge">
                      ✓ Completado
                    </span>
                  )}

                  <span className="category-badge">
                    {goal.category}
                  </span>
                </div>
              </div>

              <div className="card-content">
                <h2>{goal.name}</h2>

                {goal.description && (
                  <p>{goal.description}</p>
                )}

                <div className="progress-info">
                  <span>Progreso</span>
                  <strong>{goal.progress}%</strong>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${goal.progress}%`,
                    }}
                  />
                </div>
              </div>

              <div className="goal-actions">
                <button
                  className={
                    goal.completed
                      ? "secondary-button completed-action"
                      : "secondary-button"
                  }
                  onClick={() =>
                    toggleGoalCompleted(goal.id)
                  }
                >
                  {goal.completed
                    ? "↩ Marcar pendiente"
                    : "✓ Marcar completado"}
                </button>

                <button
                  className="secondary-button"
                  onClick={() => editGoal(goal)}
                >
                  ✏️ Editar
                </button>

                <button
                  className="delete-button"
                  onClick={() => deleteGoal(goal.id)}
                >
                  🗑️
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );

  // =========================
  // RÉCORDS
  // =========================

  const renderRecords = () => (
    <div className="page">
      <div className="section-header main-header">
        <div>
          <span className="card-label">NadiaStats</span>
          <h1>Récords personales</h1>
          <p>
            Guarda tus mejores marcas y consulta su historial.
          </p>
        </div>
      </div>

      <form className="form-card" onSubmit={handleRecordSubmit}>
        <div className="form-card-header">
          <div>
            <span className="form-icon">🏆</span>
            <div>
              <h2>
                {editingRecordId
                  ? "Editar récord"
                  : "Nuevo récord"}
              </h2>
              <p>
                {editingRecordId
                  ? "Modifica los datos del récord."
                  : "Añade una nueva marca personal."}
              </p>
            </div>
          </div>

          {editingRecordId && (
            <button
              type="button"
              className="secondary-button"
              onClick={resetRecordForm}
            >
              Cancelar
            </button>
          )}
        </div>

        <div className="form-row">
          <label>
            Nombre del récord
            <input
              type="text"
              placeholder="Ej. Parada de manos"
              value={recordForm.name}
              onChange={(event) =>
                setRecordForm({
                  ...recordForm,
                  name: event.target.value,
                })
              }
              required
            />
          </label>

          <label>
            Categoría
            <select
              value={recordForm.category}
              onChange={(event) =>
                setRecordForm({
                  ...recordForm,
                  category: event.target.value,
                })
              }
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="form-row">
          <label>
            Marca
            <input
              type="text"
              placeholder="Ej. 42"
              value={recordForm.value}
              onChange={(event) =>
                setRecordForm({
                  ...recordForm,
                  value: event.target.value,
                })
              }
              required
            />
          </label>

          <label>
            Unidad
            <input
              type="text"
              placeholder="Ej. segundos, repeticiones..."
              value={recordForm.unit}
              onChange={(event) =>
                setRecordForm({
                  ...recordForm,
                  unit: event.target.value,
                })
              }
            />
          </label>
        </div>

        <div className="form-row">
          <label>
            Fecha
            <input
              type="date"
              value={recordForm.date}
              onChange={(event) =>
                setRecordForm({
                  ...recordForm,
                  date: event.target.value,
                })
              }
            />
          </label>

          <label>
            Notas
            <input
              type="text"
              placeholder="Opcional"
              value={recordForm.notes}
              onChange={(event) =>
                setRecordForm({
                  ...recordForm,
                  notes: event.target.value,
                })
              }
            />
          </label>
        </div>

        <button className="primary-button" type="submit">
          {editingRecordId
            ? "Guardar cambios"
            : "Crear récord"}
        </button>
      </form>

      <div className="filter-bar">
        <div>
          <span className="card-label">FILTRAR</span>
          <h2>Mis récords</h2>
        </div>

        <div className="filter-buttons">
          <button
            className={
              recordFilter === "Todas"
                ? "filter-button active"
                : "filter-button"
            }
            onClick={() => setRecordFilter("Todas")}
          >
            Todas
          </button>

          {categories.map((category) => (
            <button
              key={category}
              className={
                recordFilter === category
                  ? "filter-button active"
                  : "filter-button"
              }
              onClick={() => setRecordFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="empty-card">
          <div>🏆</div>
          <h2>
            {records.length === 0
              ? "Todavía no tienes récords"
              : "No hay récords en esta categoría"}
          </h2>
          <p>
            {records.length === 0
              ? "Crea tu primera marca personal usando el formulario de arriba."
              : "Prueba a seleccionar otra categoría."}
          </p>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredRecords.map((record) => (
            <article
              className={
                record.completed
                  ? "record-card completed"
                  : "record-card"
              }
              key={record.id}
            >
              <div className="card-top">
                <span className="card-icon">🏆</span>

                <div className="card-badges">
                  {record.completed && (
                    <span className="completed-badge">
                      ✓ Completado
                    </span>
                  )}

                  <span className="category-badge">
                    {record.category}
                  </span>
                </div>
              </div>

              <div className="card-content">
                <h2>{record.name}</h2>

                <div className="record-value">
                  <strong>{record.value}</strong>
                  <span>{record.unit}</span>
                </div>

                {record.date && (
                  <p className="record-date">
                    📅 {record.date}
                  </p>
                )}

                {record.notes && (
                  <p className="record-notes">
                    {record.notes}
                  </p>
                )}

                <div className="best-record">
                  <span>⭐ Mejor marca registrada</span>
                  <strong>
                    {getBestValue(record)} {record.unit}
                  </strong>
                </div>

                {expandedRecord === record.id && (
                  <div className="record-history">
                    <div className="history-header">
                      <strong>Historial</strong>
                      <span>
                        {record.history?.length || 0} marcas
                      </span>
                    </div>

                    {(record.history || []).map(
                      (item, index) => (
                        <div
                          className="history-item"
                          key={`${record.id}-${index}`}
                        >
                          <span>
                            {item.date || "Sin fecha"}
                          </span>

                          <strong>
                            {item.value} {record.unit}
                          </strong>

                          {parseFloat(
                            String(item.value).replace(
                              ",",
                              "."
                            )
                          ) ===
                            parseFloat(
                              String(
                                getBestValue(record)
                              ).replace(",", ".")
                            ) && (
                            <span className="best-badge">
                              Mejor
                            </span>
                          )}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              <div className="record-actions">
                <button
                  className="secondary-button"
                  onClick={() =>
                    toggleRecordCompleted(record.id)
                  }
                >
                  {record.completed
                    ? "↩ Marcar pendiente"
                    : "✓ Marcar completado"}
                </button>

                <button
                  className="secondary-button"
                  onClick={() => addRecordHistory(record)}
                >
                  ➕ Nueva marca
                </button>

                <button
                  className="secondary-button"
                  onClick={() =>
                    setExpandedRecord(
                      expandedRecord === record.id
                        ? null
                        : record.id
                    )
                  }
                >
                  {expandedRecord === record.id
                    ? "Ocultar historial"
                    : "Ver historial"}
                </button>

                <button
                  className="secondary-button"
                  onClick={() => editRecord(record)}
                >
                  ✏️ Editar
                </button>

                <button
                  className="delete-button"
                  onClick={() => deleteRecord(record.id)}
                >
                  🗑️
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );

  // =========================
  // RENDER PRINCIPAL
  // =========================

  return (
    <div className="app">
      <header className="topbar">
        <button
          className="menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
        >
          ☰
        </button>

        <div className="brand">
          <span className="brand-logo">🤸</span>
          <span>NadiaStats</span>
        </div>
      </header>

      <Navigation />

      <main className="main-content">
        {section === "inicio" && renderHome()}
        {section === "objetivos" && renderGoals()}
        {section === "records" && renderRecords()}
      </main>
    </div>
  );
}

export default App;