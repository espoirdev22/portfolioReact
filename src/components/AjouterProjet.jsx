// AjouterProjet.jsx
// Formulaire contrôlé pour créer un nouveau projet
// Un formulaire contrôlé = le state React est la "source de vérité" des valeurs

import React, { useState } from 'react' // useState : hook pour l'état local du formulaire

/* ------------------------------------------------------------------
   Props attendues :
   - onAjouter {Function} : callback appelé avec les données du formulaire
   - onAnnuler {Function} : callback pour revenir à la liste sans action
------------------------------------------------------------------ */
function AjouterProjet({ onAjouter, onAnnuler }) {

  // State unique pour tous les champs du formulaire
  // Avantage : un seul state au lieu de 6 useState séparés
  const [form, setForm] = useState({
    titre:        '',
    description:  '',
    image:        '',
    technologies: '',
    dateDebut:    '',
    statut:       'en cours'
  })

  /* Gestionnaire générique pour tous les champs
     Utilise l'attribut "name" de l'input pour cibler la bonne propriété
     Évite d'écrire un handleChange par champ */
  const handleChange = (e) => {
    const { name, value } = e.target              // Destructure l'événement
    // Spread : copie tout le state actuel et remplace uniquement le champ modifié
    // [name] = syntaxe de propriété calculée ES6 (clé dynamique)
    setForm(prev => ({ ...prev, [name]: value }))
  }

  /* Validation et soumission du formulaire */
  const handleSubmit = (e) => {
    e.preventDefault()                            // Empêche le rechargement de la page (comportement natif des forms)

    // Validation : le libellé est le seul champ obligatoire
    if (!form.titre.trim()) {                   // trim() supprime les espaces avant/après
      alert('Le libellé du projet est obligatoire.')
      return                                      // Arrête l'exécution si invalide
    }

    onAjouter({
      ...form,
      technologies: form.technologies.split(',').map(t => t.trim()).filter(Boolean)
    })                               // Remonte les données au composant Dossier
  }

  return (
    // Section formulaire avec animation d'entrée (définie dans App.css)
    <section className="form-view">

      {/* Ligne décorative accent */}
      <div className="accent-line"></div>
      <h2 className="form-section-title">NOUVEAU PROJET</h2>

      {/* form avec onSubmit pour supporter la touche Entrée aussi */}
      <form onSubmit={handleSubmit}>

        {/* === LIBELLÉ (obligatoire) === */}
        <div className="form-group">
          <label htmlFor="libelle">Libellé du projet *</label>
          <input
            id="titre"
            name="titre"                        // Correspond à la clé dans le state form
            value={form.titre}                  // Valeur contrôlée par le state
            onChange={handleChange}               // Met à jour le state à chaque frappe
            placeholder="Ex : Portfolio Personnel"
            required                              // Validation HTML native (double protection)
          />
        </div>

        {/* === DESCRIPTION === */}
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Décrivez le projet en quelques phrases..."
            rows={4}                              // Hauteur initiale de la zone de texte
          />
        </div>

        {/* === URL IMAGE === */}
        <div className="form-group">
          <label htmlFor="image">URL de l'image</label>
          <input
            id="image"
            name="image"
            type="url"                            // Validation automatique du format URL
            value={form.image}
            onChange={handleChange}
            placeholder="https://..."
          />
        </div>

        {/* === TECHNOLOGIES === */}
        <div className="form-group">
          <label htmlFor="technologie">Technologies</label>
          <input
            id="technologies"
            name="technologies"
            value={form.technologies}
            onChange={handleChange}
            placeholder="React, Node.js, MongoDB..."
          />
        </div>

        {/* === DATE DE DÉBUT === */}
        <div className="form-group">
          <label htmlFor="dateDebut">Date de début</label>
          <input
            id="dateDebut"
            name="dateDebut"
            type="date"                           // Widget natif du navigateur pour la date
            value={form.dateDebut}
            onChange={handleChange}
          />
        </div>

        {/* === STATUT === */}
        <div className="form-group">
          <label htmlFor="statut">Statut</label>
          <select
            id="statut"
            name="statut"
            value={form.statut}                   // Pré-sélectionne "En cours" (valeur initiale)
            onChange={handleChange}
          >
            <option value="en cours">En cours</option>
            <option value="terminé">Terminé</option>
            <option value="archivé">Archivé</option>
          </select>
        </div>

        {/* === BOUTONS D'ACTION === */}
        <div className="form-actions">
          {/* type="submit" déclenche le onSubmit du form */}
          <button type="submit" className="btn btn-primary">
            ＋ Ajouter le projet
          </button>
          {/* type="button" évite de soumettre le formulaire accidentellement */}
          <button type="button" className="btn btn-ghost" onClick={onAnnuler}>
            Annuler
          </button>
        </div>

      </form>
    </section>
  )
}

export default AjouterProjet