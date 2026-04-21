## Pourquoi on a tenté puis renoncé aux calculs dans le Worker  
**La tentative**  
L'idée était documentée dans le journal du 5 avril 2026 (session "Sécurité + formulaires") : déplacer les calculs du simulateur (côté navigateur) vers le **Cloudflare Worker** (cerveau-declic.js). L'objectif de sécurité était de rendre le code de calcul invisible depuis le navigateur — protection du savoir-faire.  
**La décision de renoncement (ligne 196, session du 5 avril)**  
La décision est explicite :  
**"Déplacer les calculs dans le Worker : reporté indéfiniment — latence UX inacceptable, gain limité. Minification + anti-iframe + CORS couvrent 99 % des cas réels."**  
**"Déplacer les calculs dans le Worker : reporté indéfiniment — latence UX inacceptable, gain limité. Minification + anti-iframe + CORS couvrent 99 % des cas réels."**  
Deux raisons :  
1. **Latence UX inacceptable** : chaque calcul du simulateur aurait nécessité un aller-retour réseau vers Cloudflare → résultats plus lents, expérience dégradée pour le prospect.  
2. **Gain limité** : les mesures de sécurité alternatives adoptées (minification du code, protection anti-iframe, restriction CORS) couvrent déjà l'essentiel des risques réels.  
**Le sujet SSH mentionné dans les journaux**  
Il y a un abandon distinct lié au serveur (session du 29-30 mars) : l'**auto-déploiement GitHub → Hostinger a été abandonné** à cause d'une erreur SSH persistante (fatal: Remote branch principal not found). La cause racine n'a jamais été identifiée, et l'**upload manuel a été retenu** comme solution pérenne. Ce point concerne l'accès au serveur Hostinger, pas les calculs du Worker.  
Il y a un abandon distinct lié au serveur (session du 29-30 mars) : l'**auto-déploiement GitHub → Hostinger a été abandonné** à cause d'une erreur SSH persistante (fatal: Remote branch principal not found). La cause racine n'a jamais été identifiée, et l'**upload manuel a été retenu** comme solution pérenne. Ce point concerne l'accès au serveur Hostinger, pas les calculs du Worker.  
  
En résumé : les calculs n'ont pas été déplacés dans le Worker parce que ça aurait ralenti l'affichage des résultats pour l'utilisateur, pour un gain de sécurité jugé marginal par rapport à ce que la minification + CORS apportent déjà.  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
