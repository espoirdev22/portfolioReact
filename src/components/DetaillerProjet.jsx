// DetaillerProjet.jsx
// Affiche toutes les informations d'un projet sélectionné
// Contient les boutons "Annuler" (fermer le détail) et "Éditer" (passer en édition)

import React, { useState } from 'react' // useState : pour gérer le mode édition local

/* ------------------------------------------------------------------
   Props attendues :
   - projet    {Object}   : le projet complet à afficher
   - onAnnuler {Function} : ferme la vue détail, retour à la liste
   - onEditer  {Function} : reçoit les données mises à jour après édition
   - onSupprimer {Function}: supprime le projet depuis la vue détail
------------------------------------------------------------------ */
function DetaillerProjet({ projet, onAnnuler, onEditer, onSupprimer, isAdmin }) {

  // enEdition : bascule entre mode lecture et mode formulaire d'édition
  // false = on affiche les infos | true = on affiche le formulaire
  const [enEdition, setEnEdition] = useState(false)

  // formEdition : copie du projet pour l'édition sans modifier l'original
  // useState avec une fonction d'initialisation (lazy init) pour éviter
  // de recréer l'objet à chaque rendu
  const [formEdition, setFormEdition] = useState({ ...projet })

  // Si aucun projet n'est passé (sécurité), n'affiche rien
  if (!projet) return null

  /* --- Gestionnaire de modification des champs du formulaire d'édition --- */
  const handleChange = (e) => {
    const { name, value } = e.target
    // Met à jour uniquement le champ modifié dans la copie du formulaire
    setFormEdition(prev => ({ ...prev, [name]: value }))
  }

  /* --- Sauvegarde de l'édition --- */
  const handleSauver = (e) => {
    e.preventDefault()

    if (!formEdition.libelle.trim()) {
      alert('Le libellé est obligatoire.')
      return
    }

    onEditer(formEdition)       // Remonte les données modifiées vers Dossier.jsx
    setEnEdition(false)         // Repasse en mode lecture
  }

  /* --- Annulation de l'édition (sans sauvegarder) --- */
  const handleAnnulerEdition = () => {
    setFormEdition({ ...projet }) // Réinitialise le formulaire avec les données originales
    setEnEdition(false)           // Retour au mode lecture
  }

  /* ------------------------------------------------------------------
     MODE ÉDITION : affiche un formulaire inline dans la vue détail
  ------------------------------------------------------------------ */
  if (enEdition) {
    return (
      <section className="detail-view">

        <div className="accent-line"></div>
        <h2 className="form-section-title">ÉDITER — {projet.libelle}</h2>

        <form onSubmit={handleSauver}>

          <div className="form-group">
            <label htmlFor="edit-libelle">Libellé *</label>
            <input
              id="edit-libelle"
              name="libelle"
              value={formEdition.libelle}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-description">Description</label>
            <textarea
              id="edit-description"
              name="description"
              value={formEdition.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-image">URL de l'image</label>
            <input
              id="edit-image"
              name="image"
              type="url"
              value={formEdition.image}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-technologie">Technologies</label>
            <input
              id="edit-technologie"
              name="technologie"
              value={formEdition.technologie}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-dateDebut">Date de début</label>
            <input
              id="edit-dateDebut"
              name="dateDebut"
              type="date"
              value={formEdition.dateDebut}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-statut">Statut</label>
            <select
              id="edit-statut"
              name="statut"
              value={formEdition.statut}
              onChange={handleChange}
            >
              <option value="En cours">En cours</option>
              <option value="Terminé">Terminé</option>
              <option value="En pause">En pause</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              ✓ Sauvegarder
            </button>
            {/* Annuler l'édition : retour à la vue lecture sans modifier */}
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleAnnulerEdition}
            >
              Annuler
            </button>
          </div>

        </form>
      </section>
    )
  }

  /* ------------------------------------------------------------------
     MODE LECTURE : affiche les informations complètes du projet
  ------------------------------------------------------------------ */
  return (
    // section : balise sémantique pour une section de contenu indépendante
    <section className="detail-view">

      {/* Image bannière en haut de la vue détail */}
      <img
        className="detail-banner"
        src={projet.image || 'https://via.placeholder.com/760x280?text=Projet'}
        alt={projet.libelle}
        onError={e => {
          e.target.src = 'https://via.placeholder.com/760x280?text=Projet'
        }}
      />

      {/* En-tête : grand titre + boutons Annuler et Éditer (requis par le cahier des charges) */}
      <div className="detail-header">
        <h1 className="detail-title">{projet.libelle}</h1>

        {/* Groupe des boutons d'action obligatoires */}
        <div className="detail-actions">

          {/* Bouton ANNULER : masque la vue détail, retour à la liste des projets */}
          <button
            className="btn btn-ghost"
            onClick={onAnnuler}                   // Callback vers Dossier.jsx
          >
            ✕ Annuler
          </button>

          {/* Bouton ÉDITER : bascule en mode formulaire d'édition inline */}
          {isAdmin && (
            <button className="btn btn-edit" onClick={() => setEnEdition(true)}>
              ✎ Éditer
            </button>
          )}
          {isAdmin && (
            <button className="btn btn-danger" onClick={() => onSupprimer(projet._id)}>
              🗑 Supprimer
            </button>
          )}
        </div>
      </div>

      {/* Grille de métadonnées en 2 colonnes */}
      <div className="detail-meta">

        <div className="meta-block">
          <p className="meta-label">Technologies</p>
          <p className="meta-value">🛠 {projet.technologie || '—'}</p>
        </div>

        <div className="meta-block">
          <p className="meta-label">Statut</p>
          <p className="meta-value">
            {/* Badge dynamique selon le statut */}
            <span className={`status-badge ${projet.statut === 'Terminé' ? 'done' : 'wip'}`}>
              {projet.statut === 'Terminé' ? '✓' : '◉'} {projet.statut}
            </span>
          </p>
        </div>

        <div className="meta-block">
          <p className="meta-label">Date de début</p>
          <p className="meta-value">
            {projet.dateDebut
              // Formate la date ISO (2024-01-15) en format lisible français
              ? new Date(projet.dateDebut).toLocaleDateString('fr-FR', {
                day: '2-digit', month: 'long', year: 'numeric'
              })
              : '—'}
          </p>
        </div>

        <div className="meta-block">
          <p className="meta-label">Identifiant</p>
          {/* padStart(3,'0') : formate l'id sur 3 chiffres ex: 1 → 001 */}
          <p className="meta-value" style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>
            #{String(projet.id).padStart(3, '0')}
          </p>
        </div>

      </div>

      {/* Description complète */}
      <div className="detail-desc">
        <p className="meta-label" style={{ marginBottom: '0.6rem' }}>Description</p>
        <p>{projet.description || 'Aucune description disponible.'}</p>
      </div>

    </section>
  )
}

export default DetaillerProjet