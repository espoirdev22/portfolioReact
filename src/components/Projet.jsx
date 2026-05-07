// Projet.jsx
// Composant carte d'un projet individuel dans la grille
// Affiche : image, libellé (ancre), technologie, statut, bouton Supprimer

import React from 'react' // Import React obligatoire pour utiliser JSX

/* ------------------------------------------------------------------
   Props attendues :
   - projet      {Object}   : objet complet du projet à afficher
   - onSupprimer {Function} : callback appelé avec l'id pour supprimer
   - onDetail    {Function} : callback appelé avec le projet pour voir le détail
------------------------------------------------------------------ */
function Projet({ projet, onSupprimer, onDetail }) {

  // Classe CSS dynamique du badge statut selon la valeur du champ statut
  const badgeClass = projet.statut === 'terminé'
  ? 'status-badge done'  // Vert pour Terminé
    : 'status-badge wip'   // Orange pour En cours

  return (
    // article : élément HTML sémantique pour un contenu autonome (carte)
    <article className="projet-card">

      {/* Image illustrant le projet */}
      <img
        className="projet-img"
        src={projet.image}                       // URL de l'image stockée en base
        alt={`Aperçu de ${projet.titre}`}      // Texte alternatif pour l'accessibilité
        onError={e => {
          // Si l'image ne charge pas, affiche une image de remplacement
          e.target.src = 'https://via.placeholder.com/400x160?text=Projet'
        }}
      />

      <div className="projet-body">

        {/* Libellé = ancre cliquable — spécification fonctionnelle obligatoire
            Le clic déclenche l'affichage de la vue DetaillerProjet */}
        <a
          className="projet-title"
          onClick={() => onDetail(projet)}        // Passe l'objet projet complet au parent
          role="button"                           // Sémantique ARIA pour les lecteurs d'écran
          tabIndex={0}                            // Permet la navigation clavier (Tab)
          onKeyDown={e => {
            // Accessibilité : la touche Entrée déclenche aussi le détail
            if (e.key === 'Enter') onDetail(projet)
          }}
        >
          {projet.titre}   {/* Texte du lien = nom du projet */}
        </a>

        {/* Ligne de technologie avec icône outil */}
        <p className="projet-tech">🛠 {projet.technologies?.join(', ')}</p>

      </div>

      {/* Pied de carte : badge statut à gauche, bouton Supprimer à droite */}
      <div className="projet-footer">

        {/* Badge coloré indiquant le statut du projet */}
        <span className={badgeClass}>
          {projet.statut === 'Terminé' ? '✓' : '◉'} {projet.statut}
        </span>

        {/* Bouton Supprimer — déclenche la suppression via le composant parent Dossier */}
        <button
          className="btn btn-danger"
          onClick={() => onSupprimer(projet._id)}  // Passe uniquement l'id, pas l'objet entier
        >
          🗑 Supprimer
        </button>
      </div>

    </article>
  )
}

// Export du composant pour pouvoir l'importer dans Dossier.jsx
export default Projet