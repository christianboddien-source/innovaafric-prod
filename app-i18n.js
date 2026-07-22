'use strict';
// InnovaAFRIC · i18n de la mega app (index.html) — ES / FR / EN.
// Traduce por coincidencia EXACTA del texto español (no necesita data-i18n).
// Un MutationObserver traduce también lo que se pinta dinámicamente (listas,
// toasts, tarjetas). Los mensajes crudos del servidor se quedan en español.
// El idioma se guarda en localStorage 'ia_lang' y se cambia con iaCycleLang().
(function () {
  const D = {
    // ── Login / registro / sesión ──
    'Entrar': { fr: 'Se connecter', en: 'Log in' },
    'Inicia sesión': { fr: 'Connecte-toi', en: 'Log in' },
    'Inicia sesión en tu cuenta': { fr: 'Connecte-toi à ton compte', en: 'Log in to your account' },
    'Correo electrónico': { fr: 'Adresse e-mail', en: 'Email address' },
    'Contraseña': { fr: 'Mot de passe', en: 'Password' },
    'Contraseña (mín. 8 caracteres)': { fr: 'Mot de passe (min. 8 caractères)', en: 'Password (min. 8 characters)' },
    'Contraseña actual': { fr: 'Mot de passe actuel', en: 'Current password' },
    'Nueva contraseña': { fr: 'Nouveau mot de passe', en: 'New password' },
    'Confirmar nueva contraseña': { fr: 'Confirmer le nouveau mot de passe', en: 'Confirm new password' },
    'Cambiar contraseña': { fr: 'Changer le mot de passe', en: 'Change password' },
    'Crear cuenta gratis →': { fr: 'Créer un compte gratuit →', en: 'Create free account →' },
    '✓ Crear cuenta': { fr: '✓ Créer un compte', en: '✓ Create account' },
    '¿No tienes cuenta?': { fr: 'Pas de compte ?', en: "Don't have an account?" },
    '¿Ya tienes cuenta?': { fr: 'Tu as déjà un compte ?', en: 'Already have an account?' },
    '← Iniciar sesión': { fr: '← Se connecter', en: '← Log in' },
    'Nombre completo': { fr: 'Nom complet', en: 'Full name' },
    'Número de teléfono': { fr: 'Numéro de téléphone', en: 'Phone number' },
    'Al registrarte aceptas nuestros': { fr: 'En t’inscrivant, tu acceptes nos', en: 'By signing up you accept our' },
    'Términos de Servicio': { fr: 'Conditions de service', en: 'Terms of Service' },
    'Política de Privacidad': { fr: 'Politique de confidentialité', en: 'Privacy Policy' },
    'Cerrar sesión': { fr: 'Se déconnecter', en: 'Log out' },
    '🚪 Cerrar sesión': { fr: '🚪 Se déconnecter', en: '🚪 Log out' },
    '🚪 Cerrar todas las sesiones': { fr: '🚪 Fermer toutes les sessions', en: '🚪 Close all sessions' },
    'Sesiones activas': { fr: 'Sessions actives', en: 'Active sessions' },
    'Sesión actual — Este dispositivo': { fr: 'Session actuelle — Cet appareil', en: 'Current session — This device' },
    'Seguridad y contraseña': { fr: 'Sécurité et mot de passe', en: 'Security & password' },
    '🔐 Seguridad': { fr: '🔐 Sécurité', en: '🔐 Security' },
    '🔐 Actualizar contraseña': { fr: '🔐 Mettre à jour le mot de passe', en: '🔐 Update password' },

    // ── Navegación / barra inferior ──
    'Home': { fr: 'Accueil', en: 'Home' },
    'Wallet': { fr: 'Portefeuille', en: 'Wallet' },
    'Mi Wallet': { fr: 'Mon portefeuille', en: 'My Wallet' },
    'Shop': { fr: 'Boutique', en: 'Shop' },
    'Pedidos': { fr: 'Commandes', en: 'Orders' },
    'Perfil': { fr: 'Profil', en: 'Profile' },
    'Mi Perfil': { fr: 'Mon profil', en: 'My Profile' },
    'Mi cuenta': { fr: 'Mon compte', en: 'My account' },

    // ── Home / saldo / acciones ──
    'Saldo total': { fr: 'Solde total', en: 'Total balance' },
    'Saldo disponible': { fr: 'Solde disponible', en: 'Available balance' },
    'SALDO DISPONIBLE': { fr: 'SOLDE DISPONIBLE', en: 'AVAILABLE BALANCE' },
    'Actualizado': { fr: 'Mis à jour', en: 'Updated' },
    'ocultar': { fr: 'masquer', en: 'hide' },
    '⟳ refrescar': { fr: '⟳ actualiser', en: '⟳ refresh' },
    '📈 +2.3% este mes': { fr: '📈 +2,3 % ce mois-ci', en: '📈 +2.3% this month' },
    'Este mes': { fr: 'Ce mois-ci', en: 'This month' },
    'En tiempo real': { fr: 'En temps réel', en: 'Real time' },
    'Enviar': { fr: 'Envoyer', en: 'Send' },
    'Recibir': { fr: 'Recevoir', en: 'Receive' },
    'Cambiar': { fr: 'Convertir', en: 'Exchange' },
    'Retirar': { fr: 'Retirer', en: 'Withdraw' },
    'Ecosistema': { fr: 'Écosystème', en: 'Ecosystem' },
    'Servicios': { fr: 'Services', en: 'Services' },
    'Ver todo →': { fr: 'Tout voir →', en: 'See all →' },
    'Ver todos →': { fr: 'Tout voir →', en: 'See all →' },
    'Ver todas →': { fr: 'Tout voir →', en: 'See all →' },
    'Ver →': { fr: 'Voir →', en: 'View →' },
    'Comprar →': { fr: 'Acheter →', en: 'Buy →' },
    'Enviar →': { fr: 'Envoyer →', en: 'Send →' },
    'Tiendas →': { fr: 'Boutiques →', en: 'Stores →' },
    'Track →': { fr: 'Suivi →', en: 'Track →' },
    'Últimos movimientos': { fr: 'Derniers mouvements', en: 'Recent activity' },
    'Últimos cobros': { fr: 'Derniers encaissements', en: 'Recent receipts' },
    'Nuestra comunidad': { fr: 'Notre communauté', en: 'Our community' },
    'España · Francia · África': { fr: 'Espagne · France · Afrique', en: 'Spain · France · Africa' },

    // ── Ecosistema / marcas (servicios) ──
    'Enviar y recibir dinero': { fr: 'Envoyer et recevoir de l’argent', en: 'Send & receive money' },
    'Envíos, pagos y recibos': { fr: 'Envois, paiements et reçus', en: 'Transfers, payments & receipts' },
    'Mapa live': { fr: 'Carte en direct', en: 'Live map' },
    'Cerca de mí': { fr: 'Près de moi', en: 'Near me' },
    'Facturas': { fr: 'Factures', en: 'Bills' },
    'Pagar servicios': { fr: 'Payer des services', en: 'Pay services' },
    'Pagar factura': { fr: 'Payer une facture', en: 'Pay bill' },
    'POS': { fr: 'TPE', en: 'POS' },
    'Terminal POS': { fr: 'Terminal TPE', en: 'POS terminal' },
    'Seguro': { fr: 'Assurance', en: 'Insurance' },
    'Seguros': { fr: 'Assurances', en: 'Insurance' },
    'Tarjetas': { fr: 'Cartes', en: 'Cards' },
    'Tarjetas virtuales': { fr: 'Cartes virtuelles', en: 'Virtual cards' },
    'Inversión': { fr: 'Investissement', en: 'Investment' },
    'Ahorro': { fr: 'Épargne', en: 'Savings' },
    'Mis ahorros': { fr: 'Mon épargne', en: 'My savings' },
    'Tontinas': { fr: 'Tontines', en: 'Tontines' },
    'Pago QR': { fr: 'Paiement QR', en: 'QR payment' },
    'InnovaBot': { fr: 'InnovaBot', en: 'InnovaBot' },
    'InnovaBot · Asistente': { fr: 'InnovaBot · Assistant', en: 'InnovaBot · Assistant' },
    'Soporte': { fr: 'Support', en: 'Support' },
    'Chat con soporte': { fr: 'Chat avec le support', en: 'Chat with support' },
    'Asistente financiero 24/7': { fr: 'Assistant financier 24/7', en: '24/7 financial assistant' },

    // ── Ofertas / publicidad ──
    'Ofertas': { fr: 'Offres', en: 'Deals' },
    'Ofertas y publicidad': { fr: 'Offres et publicité', en: 'Offers & ads' },
    'Publicidad & Ofertas': { fr: 'Publicité & offres', en: 'Ads & offers' },
    '📢 Publicidad & ofertas': { fr: '📢 Publicité & offres', en: '📢 Ads & offers' },
    'Promociones de socios': { fr: 'Promotions des partenaires', en: 'Partner promotions' },
    'Promo': { fr: 'Promo', en: 'Promo' },
    'Nuevo': { fr: 'Nouveau', en: 'New' },
    'Oferta': { fr: 'Offre', en: 'Deal' },
    'Gratis': { fr: 'Gratuit', en: 'Free' },
    'Tienda': { fr: 'Boutique', en: 'Store' },
    'Envía sin comisión': { fr: 'Envoie sans commission', en: 'Send with no fees' },
    'Primeras 3 transferencias sin comisión este mes': { fr: 'Les 3 premiers transferts sans commission ce mois-ci', en: 'First 3 transfers free this month' },
    'Mercado africano online': { fr: 'Marché africain en ligne', en: 'African market online' },
    'Productos auténticos de África directo a tu puerta': { fr: 'Produits authentiques d’Afrique livrés chez toi', en: 'Authentic African products to your door' },
    'Pregunta sobre envíos, tasas y cambio de divisas': { fr: 'Pose des questions sur les envois, taux et change', en: 'Ask about transfers, rates and exchange' },
    'Ahorra en comunidad': { fr: 'Épargne en communauté', en: 'Save together' },
    'Únete a una tontina y multiplica tus ahorros': { fr: 'Rejoins une tontine et multiplie ton épargne', en: 'Join a tontine and grow your savings' },
    'Protege lo que amas': { fr: 'Protège ce que tu aimes', en: 'Protect what you love' },
    'Seguro de vida y salud desde 3 500 XAF/mes': { fr: 'Assurance vie et santé dès 3 500 XAF/mois', en: 'Life & health insurance from 3,500 XAF/mo' },

    // ── Enviar dinero ──
    'Enviar dinero': { fr: 'Envoyer de l’argent', en: 'Send money' },
    'Tú envías': { fr: 'Tu envoies', en: 'You send' },
    'Destinatario recibe': { fr: 'Le destinataire reçoit', en: 'Recipient gets' },
    'Destinatario (código IA, email o teléfono)': { fr: 'Destinataire (code IA, e-mail ou téléphone)', en: 'Recipient (IA code, email or phone)' },
    'O introduce el código IA o email del destinatario': { fr: 'Ou saisis le code IA ou l’e-mail du destinataire', en: 'Or enter the recipient’s IA code or email' },
    'Nota (opcional)': { fr: 'Note (facultatif)', en: 'Note (optional)' },
    'Ej: Alquiler de marzo': { fr: 'Ex : Loyer de mars', en: 'e.g. March rent' },
    '💸 Confirmar envío': { fr: '💸 Confirmer l’envoi', en: '💸 Confirm transfer' },
    '⚡ Llegará en menos de 5 minutos': { fr: '⚡ Arrive en moins de 5 minutes', en: '⚡ Arrives in under 5 minutes' },
    'Envío realizado': { fr: 'Transfert effectué', en: 'Transfer sent' },
    'El dinero está en camino ⚡': { fr: 'L’argent est en route ⚡', en: 'The money is on its way ⚡' },

    // ── Recibir / QR ──
    'Recibir dinero': { fr: 'Recevoir de l’argent', en: 'Receive money' },
    'Tu enlace de cobro': { fr: 'Ton lien de paiement', en: 'Your payment link' },
    'Comparte para recibir dinero al instante': { fr: 'Partage pour recevoir de l’argent instantanément', en: 'Share to get paid instantly' },
    'Acepta EUR · XAF · USD · XOF': { fr: 'Accepte EUR · XAF · USD · XOF', en: 'Accepts EUR · XAF · USD · XOF' },
    'Cobro instantáneo sin comisión': { fr: 'Encaissement instantané sans commission', en: 'Instant fee-free payments' },
    'para ver tu QR': { fr: 'pour voir ton QR', en: 'to see your QR' },
    'para generar el QR': { fr: 'pour générer le QR', en: 'to generate the QR' },
    'Tu QR personal para recibir pagos': { fr: 'Ton QR personnel pour recevoir des paiements', en: 'Your personal QR to receive payments' },
    '📋 Copiar enlace': { fr: '📋 Copier le lien', en: '📋 Copy link' },
    '📋 Copiar enlace de cobro': { fr: '📋 Copier le lien de paiement', en: '📋 Copy payment link' },
    '📤 Compartir': { fr: '📤 Partager', en: '📤 Share' },
    '📤 Compartir QR': { fr: '📤 Partager le QR', en: '📤 Share QR' },
    '📱 Mostrar mi QR': { fr: '📱 Afficher mon QR', en: '📱 Show my QR' },
    '📷 Escanear': { fr: '📷 Scanner', en: '📷 Scan' },
    '📷 Abrir cámara': { fr: '📷 Ouvrir la caméra', en: '📷 Open camera' },
    '✕ Cerrar cámara': { fr: '✕ Fermer la caméra', en: '✕ Close camera' },
    'Escanear QR de pago': { fr: 'Scanner le QR de paiement', en: 'Scan payment QR' },
    'Apunta la cámara al código QR del destinatario': { fr: 'Pointe la caméra vers le QR du destinataire', en: 'Point the camera at the recipient’s QR' },
    'Buscando código QR…': { fr: 'Recherche du QR…', en: 'Looking for QR code…' },
    '💳 Pagar con QR': { fr: '💳 Payer par QR', en: '💳 Pay with QR' },
    'Importe a cobrar': { fr: 'Montant à encaisser', en: 'Amount to charge' },
    'Enlace copiado': { fr: 'Lien copié', en: 'Link copied' },
    'Pégalo donde quieras para recibir pagos': { fr: 'Colle-le où tu veux pour recevoir des paiements', en: 'Paste it anywhere to get paid' },
    'Comparte con tu cliente': { fr: 'Partage avec ton client', en: 'Share with your customer' },

    // ── Cambiar divisa ──
    'Cambiar divisa': { fr: 'Convertir une devise', en: 'Exchange currency' },
    'Conversión entre monedas': { fr: 'Conversion entre devises', en: 'Currency conversion' },
    'Tienes': { fr: 'Tu as', en: 'You have' },
    'Recibirás': { fr: 'Tu recevras', en: 'You’ll get' },
    'Selecciona divisa destino': { fr: 'Choisis la devise de destination', en: 'Select target currency' },
    'Confirmar cambio →': { fr: 'Confirmer la conversion →', en: 'Confirm exchange →' },
    'Franco CFA': { fr: 'Franc CFA', en: 'CFA Franc' },
    'Dólar': { fr: 'Dollar', en: 'Dollar' },
    'Cedi ghanés': { fr: 'Cedi ghanéen', en: 'Ghanaian Cedi' },
    'Libra esterlina': { fr: 'Livre sterling', en: 'Pound sterling' },
    'Cambio de divisa': { fr: 'Change de devise', en: 'Currency exchange' },
    'Esta función estará disponible pronto. Por ahora puedes ver tus saldos en múltiples divisas en la pantalla de inicio.': { fr: 'Cette fonction sera bientôt disponible. En attendant, tu peux voir tes soldes en plusieurs devises sur l’accueil.', en: 'This feature is coming soon. For now you can see your balances in multiple currencies on the home screen.' },

    // ── Retirar ──
    'Retirar dinero': { fr: 'Retirer de l’argent', en: 'Withdraw money' },
    '¿Cuánto quieres retirar?': { fr: 'Combien veux-tu retirer ?', en: 'How much do you want to withdraw?' },
    'Mínimo retiro: 5 000 XAF · Sin comisión XenderMoney': { fr: 'Retrait minimum : 5 000 XAF · Sans commission XenderMoney', en: 'Minimum withdrawal: 5,000 XAF · No XenderMoney fee' },
    'Destino del retiro': { fr: 'Destination du retrait', en: 'Withdrawal destination' },
    'Cuenta bancaria SEPA': { fr: 'Compte bancaire SEPA', en: 'SEPA bank account' },
    '1-2 días hábiles': { fr: '1-2 jours ouvrés', en: '1-2 business days' },
    'MTN Mobile Money': { fr: 'MTN Mobile Money', en: 'MTN Mobile Money' },
    'Orange Money': { fr: 'Orange Money', en: 'Orange Money' },
    'Inmediato': { fr: 'Immédiat', en: 'Instant' },
    'Cuenta / número de destino': { fr: 'Compte / numéro de destination', en: 'Destination account / number' },
    'IBAN, nº de móvil o punto autorizado': { fr: 'IBAN, n° de mobile ou point autorisé', en: 'IBAN, mobile no. or authorized point' },
    'Solicitar retiro →': { fr: 'Demander le retrait →', en: 'Request withdrawal →' },
    '🏧 Retiro a banco': { fr: '🏧 Retrait vers banque', en: '🏧 Bank withdrawal' },
    'Cash en punto XenderMoney': { fr: 'Cash en point XenderMoney', en: 'Cash at XenderMoney point' },
    'Establecimiento autorizado · Inmediato': { fr: 'Établissement autorisé · Immédiat', en: 'Authorized outlet · Instant' },
    // ── Cambio de divisa ──
    'Tú cambias': { fr: 'Tu convertis', en: 'You convert' },
    'Saldo': { fr: 'Solde', en: 'Balance' },
    'Euro': { fr: 'Euro', en: 'Euro' },
    'Franco CFA Oeste': { fr: 'Franc CFA Ouest', en: 'West African CFA' },

    // ── Shop / tienda ──
    'Buscar productos…': { fr: 'Rechercher des produits…', en: 'Search products…' },
    'Todo': { fr: 'Tout', en: 'All' },
    'Electrónica': { fr: 'Électronique', en: 'Electronics' },
    'Energía solar': { fr: 'Énergie solaire', en: 'Solar energy' },
    'Accesorios': { fr: 'Accessoires', en: 'Accessories' },
    'Cereales': { fr: 'Céréales', en: 'Cereals' },
    'Aceites': { fr: 'Huiles', en: 'Oils' },
    'Frutas y verduras': { fr: 'Fruits et légumes', en: 'Fruits & vegetables' },
    'Lácteos': { fr: 'Produits laitiers', en: 'Dairy' },
    'Paga con XenderMoney · sin comisión': { fr: 'Paie avec XenderMoney · sans commission', en: 'Pay with XenderMoney · no fees' },
    'Vender en XenderShop': { fr: 'Vendre sur XenderShop', en: 'Sell on XenderShop' },
    'Comprar producto': { fr: 'Acheter le produit', en: 'Buy product' },
    'Cantidad': { fr: 'Quantité', en: 'Quantity' },
    'Dirección de entrega': { fr: 'Adresse de livraison', en: 'Delivery address' },
    'Calle, ciudad, país': { fr: 'Rue, ville, pays', en: 'Street, city, country' },
    'Comprar y pagar →': { fr: 'Acheter et payer →', en: 'Buy and pay →' },
    'Sin stock': { fr: 'Rupture de stock', en: 'Out of stock' },
    'Este producto no está disponible ahora mismo.': { fr: 'Ce produit n’est pas disponible pour le moment.', en: 'This product is not available right now.' },
    'Sin movimientos aún': { fr: 'Aucun mouvement pour l’instant', en: 'No activity yet' },
    'Pedido confirmado': { fr: 'Commande confirmée', en: 'Order confirmed' },
    'Aún no has hecho ninguna compra': { fr: 'Tu n’as encore fait aucun achat', en: 'You haven’t made any purchases yet' },
    'Cargando productos…': { fr: 'Chargement des produits…', en: 'Loading products…' },
    'No hay productos disponibles en esta sección.': { fr: 'Aucun produit disponible dans cette section.', en: 'No products available in this section.' },
    'Ningún producto coincide con tu búsqueda.': { fr: 'Aucun produit ne correspond à ta recherche.', en: 'No products match your search.' },
    'No hay ofertas activas en este momento.': { fr: 'Aucune offre active pour le moment.', en: 'No active deals at the moment.' },
    'No se pudo conectar con la tienda. Inténtalo de nuevo.': { fr: 'Impossible de se connecter à la boutique. Réessaie.', en: 'Could not connect to the store. Try again.' },
    'El catálogo no está disponible ahora mismo.': { fr: 'Le catalogue n’est pas disponible pour le moment.', en: 'The catalog is not available right now.' },
    'Cargando compras…': { fr: 'Chargement des achats…', en: 'Loading purchases…' },
    'Inicia sesión para ver tus compras': { fr: 'Connecte-toi pour voir tes achats', en: 'Log in to see your purchases' },
    'Solicita el primero cuando lo necesites.': { fr: 'Demande le premier quand tu en as besoin.', en: 'Request your first one when you need it.' },
    'No se pudieron cargar tus préstamos.': { fr: 'Impossible de charger tes prêts.', en: 'Could not load your loans.' },
    'No se pudieron cargar tus cuentas bancarias.': { fr: 'Impossible de charger tes comptes bancaires.', en: 'Could not load your bank accounts.' },
    'No tienes cuentas bancarias añadidas aún.': { fr: 'Tu n’as pas encore ajouté de compte bancaire.', en: 'You haven’t added any bank accounts yet.' },

    // ── Delivery / seguimiento ──
    'Rastrear': { fr: 'Suivre', en: 'Track' },
    'Delivery': { fr: 'Livraison', en: 'Delivery' },
    'Código de pedido (ej. XD-…)': { fr: 'Code de commande (ex. XD-…)', en: 'Order code (e.g. XD-…)' },
    '📞 Llamar rider': { fr: '📞 Appeler le livreur', en: '📞 Call rider' },
    '💬 Chat': { fr: '💬 Chat', en: '💬 Chat' },
    'Rider': { fr: 'Livreur', en: 'Rider' },
    'En ruta': { fr: 'En route', en: 'On the way' },
    'Ubicación en vivo compartida': { fr: 'Position en direct partagée', en: 'Live location shared' },
    'Actualiza cada 10 seg · toca para ver': { fr: 'Mise à jour toutes les 10 s · touche pour voir', en: 'Updates every 10s · tap to view' },
    'Escribe un mensaje…': { fr: 'Écris un message…', en: 'Type a message…' },
    'Estoy en casa 🏠': { fr: 'Je suis chez moi 🏠', en: 'I’m home 🏠' },
    'OK, te espero': { fr: 'OK, je t’attends', en: 'OK, I’ll wait' },
    '¿Cuánto tardarás?': { fr: 'Tu en as pour combien de temps ?', en: 'How long will you take?' },
    '¡Pedido entregado!': { fr: 'Commande livrée !', en: 'Order delivered!' },
    'Foto de confirmación': { fr: 'Photo de confirmation', en: 'Confirmation photo' },
    'Foto tomada por el rider': { fr: 'Photo prise par le livreur', en: 'Photo taken by the rider' },
    'Prueba de entrega verificada': { fr: 'Preuve de livraison vérifiée', en: 'Verified proof of delivery' },
    '✓ Validada automáticamente': { fr: '✓ Validée automatiquement', en: '✓ Automatically validated' },
    'Pago liberado al rider': { fr: 'Paiement libéré au livreur', en: 'Payment released to rider' },
    'Transferido automáticamente': { fr: 'Transféré automatiquement', en: 'Transferred automatically' },
    '📄 Ver recibo': { fr: '📄 Voir le reçu', en: '📄 View receipt' },
    '🔄 Nuevo pedido': { fr: '🔄 Nouvelle commande', en: '🔄 New order' },
    // ── Confirmación de entrega + reseñas ──
    'Confirma la recepción': { fr: 'Confirme la réception', en: 'Confirm receipt' },
    'Confirma que has recibido tu pedido. Puedes verificarlo de varias formas:': { fr: 'Confirme que tu as reçu ta commande. Tu peux le vérifier de plusieurs façons :', en: 'Confirm you received your order. You can verify it in several ways:' },
    'Código de cliente': { fr: 'Code client', en: 'Customer code' },
    'Código recibido al pedir (ej. XD-…)': { fr: 'Code reçu à la commande (ex. XD-…)', en: 'Code received when ordering (e.g. XD-…)' },
    'Foto del paquete recibido': { fr: 'Photo du colis reçu', en: 'Photo of received package' },
    '📷 Añadir foto': { fr: '📷 Ajouter une photo', en: '📷 Add photo' },
    'Firma digital': { fr: 'Signature numérique', en: 'Digital signature' },
    'Borrar': { fr: 'Effacer', en: 'Clear' },
    'Firma con el dedo dentro del recuadro blanco.': { fr: 'Signe avec le doigt dans le cadre blanc.', en: 'Sign with your finger inside the white box.' },
    'Comentario (opcional)': { fr: 'Commentaire (facultatif)', en: 'Comment (optional)' },
    'Ej: Paquete recibido a tiempo por Moussa Diallo': { fr: 'Ex : Colis reçu à temps par Moussa Diallo', en: 'e.g. Package received on time by Moussa Diallo' },
    'Valora tu experiencia': { fr: 'Évalue ton expérience', en: 'Rate your experience' },
    'Toca las estrellas para puntuar': { fr: 'Touche les étoiles pour noter', en: 'Tap the stars to rate' },
    '✓ Confirmar recepción y enviar reseña': { fr: '✓ Confirmer la réception et envoyer l’avis', en: '✓ Confirm receipt and send review' },
    'Verificado': { fr: 'Vérifié', en: 'Verified' },
    'Adjuntar foto disponible próximamente.': { fr: 'Pièce jointe photo bientôt disponible.', en: 'Photo attachment coming soon.' },
    'Nota de voz': { fr: 'Note vocale', en: 'Voice note' },
    'Función de audio disponible próximamente.': { fr: 'Fonction audio bientôt disponible.', en: 'Audio feature coming soon.' },

    // ── Perfil / datos personales ──
    'Datos personales': { fr: 'Données personnelles', en: 'Personal details' },
    'Datos personales *': { fr: 'Données personnelles *', en: 'Personal details *' },
    'Información de cuenta': { fr: 'Informations du compte', en: 'Account information' },
    'Para modificar tus datos, contacta a soporte.': { fr: 'Pour modifier tes données, contacte le support.', en: 'To change your details, contact support.' },
    'Estado KYC': { fr: 'Statut KYC', en: 'KYC status' },
    '⏳ Pendiente': { fr: '⏳ En attente', en: '⏳ Pending' },
    '⏳ Pendiente KYC': { fr: '⏳ KYC en attente', en: '⏳ KYC pending' },
    'Cliente': { fr: 'Client', en: 'Customer' },
    'Circular': { fr: 'Circulaire', en: 'Circular' },
    'Circular autorizada': { fr: 'Circulaire autorisée', en: 'Authorized circular' },
    'Código IA Interno': { fr: 'Code IA interne', en: 'Internal IA code' },
    'CÓDIGO IA INTERNO': { fr: 'CODE IA INTERNE', en: 'INTERNAL IA CODE' },
    'Ubicación': { fr: 'Emplacement', en: 'Location' },
    'Ubicación *': { fr: 'Emplacement *', en: 'Location *' },
    'NOMBRE COMPLETO': { fr: 'NOM COMPLET', en: 'FULL NAME' },
    'Email': { fr: 'E-mail', en: 'Email' },
    'EMAIL': { fr: 'E-MAIL', en: 'EMAIL' },
    'Teléfono': { fr: 'Téléphone', en: 'Phone' },
    'TELÉFONO': { fr: 'TÉLÉPHONE', en: 'PHONE' },
    'País': { fr: 'Pays', en: 'Country' },
    'PAÍS': { fr: 'PAYS', en: 'COUNTRY' },
    'Ciudad': { fr: 'Ville', en: 'City' },
    'CIUDAD': { fr: 'VILLE', en: 'CITY' },
    'ROL': { fr: 'RÔLE', en: 'ROLE' },
    'Dirección': { fr: 'Adresse', en: 'Address' },
    'Modo oscuro': { fr: 'Mode sombre', en: 'Dark mode' },
    'Toca para cambiar el tema': { fr: 'Touche pour changer le thème', en: 'Tap to change the theme' },
    '🖨️ Imprimir perfil': { fr: '🖨️ Imprimer le profil', en: '🖨️ Print profile' },
    '📊 Extracto PDF': { fr: '📊 Relevé PDF', en: '📊 PDF statement' },
    '📋 Fiscal & Comisiones': { fr: '📋 Fiscalité & commissions', en: '📋 Tax & fees' },
    '📲 Compartir app por WhatsApp': { fr: '📲 Partager l’app via WhatsApp', en: '📲 Share app via WhatsApp' },

    // ── Foto de perfil / biométrico ──
    'Foto de perfil': { fr: 'Photo de profil', en: 'Profile photo' },
    '📷 Cambiar foto': { fr: '📷 Changer la photo', en: '📷 Change photo' },
    '🗑️ Eliminar foto': { fr: '🗑️ Supprimer la photo', en: '🗑️ Remove photo' },
    'Foto actualizada': { fr: 'Photo mise à jour', en: 'Photo updated' },
    '✓ Tu foto de perfil se ha guardado': { fr: '✓ Ta photo de profil a été enregistrée', en: '✓ Your profile photo has been saved' },
    'Foto eliminada': { fr: 'Photo supprimée', en: 'Photo removed' },
    'Se ha restaurado el avatar predeterminado': { fr: 'L’avatar par défaut a été restauré', en: 'Default avatar restored' },
    'La imagen debe ser menor de 5 MB': { fr: 'L’image doit faire moins de 5 Mo', en: 'Image must be under 5 MB' },
    'Bloqueo biométrico': { fr: 'Verrouillage biométrique', en: 'Biometric lock' },
    'Huella dactilar · Face ID': { fr: 'Empreinte · Face ID', en: 'Fingerprint · Face ID' },
    'Desactivado — La app no requiere biométrico al abrir': { fr: 'Désactivé — L’app ne demande pas la biométrie à l’ouverture', en: 'Off — The app doesn’t require biometrics on open' },
    'Desbloquear con biométrico': { fr: 'Déverrouiller par biométrie', en: 'Unlock with biometrics' },
    'Usa tu huella dactilar o Face ID': { fr: 'Utilise ton empreinte ou Face ID', en: 'Use your fingerprint or Face ID' },
    'La app está bloqueada': { fr: 'L’app est verrouillée', en: 'The app is locked' },
    '🔓 Desbloquear ahora': { fr: '🔓 Déverrouiller maintenant', en: '🔓 Unlock now' },
    '🔍 Probar biométrico ahora': { fr: '🔍 Tester la biométrie maintenant', en: '🔍 Test biometrics now' },
    'Biométrico OK': { fr: 'Biométrie OK', en: 'Biometrics OK' },
    '✓ Autenticación biométrica correcta': { fr: '✓ Authentification biométrique réussie', en: '✓ Biometric authentication successful' },
    'Biométrico activado': { fr: 'Biométrie activée', en: 'Biometrics enabled' },
    '🔒 La app quedará bloqueada en segundo plano': { fr: '🔒 L’app se verrouillera en arrière-plan', en: '🔒 The app will lock in the background' },
    'Bloqueo biométrico desactivado': { fr: 'Verrouillage biométrique désactivé', en: 'Biometric lock disabled' },
    'No configurado': { fr: 'Non configuré', en: 'Not set up' },
    'Primero activa el bloqueo biométrico': { fr: 'Active d’abord le verrouillage biométrique', en: 'First enable the biometric lock' },
    'No disponible': { fr: 'Non disponible', en: 'Not available' },
    'Tu dispositivo o navegador no soporta WebAuthn. Prueba en el móvil.': { fr: 'Ton appareil ou navigateur ne prend pas en charge WebAuthn. Essaie sur mobile.', en: 'Your device or browser doesn’t support WebAuthn. Try on mobile.' },

    // ── Notificaciones ──
    'Notificaciones': { fr: 'Notifications', en: 'Notifications' },
    '🔔 Notificaciones': { fr: '🔔 Notifications', en: '🔔 Notifications' },
    'Notificaciones push': { fr: 'Notifications push', en: 'Push notifications' },
    '🔔 Activar notificaciones push': { fr: '🔔 Activer les notifications push', en: '🔔 Enable push notifications' },
    'Marcar todo leído': { fr: 'Tout marquer comme lu', en: 'Mark all read' },
    'Sin notificaciones nuevas': { fr: 'Aucune nouvelle notification', en: 'No new notifications' },
    'Sin notificaciones': { fr: 'Aucune notification', en: 'No notifications' },
    'Inicios de sesión y alertas': { fr: 'Connexions et alertes', en: 'Logins & alerts' },
    'Respuestas del asistente': { fr: 'Réponses de l’assistant', en: 'Assistant replies' },
    'Recordatorios de cuota': { fr: 'Rappels de cotisation', en: 'Contribution reminders' },
    'Permisos denegados por el usuario': { fr: 'Autorisations refusées par l’utilisateur', en: 'Permissions denied by user' },
    '⚙️ Activar en configuración del navegador': { fr: '⚙️ Activer dans les réglages du navigateur', en: '⚙️ Enable in browser settings' },
    'Ve a Configuración → Privacidad → Notificaciones para desbloquear': { fr: 'Va dans Réglages → Confidentialité → Notifications pour débloquer', en: 'Go to Settings → Privacy → Notifications to unblock' },
    '🧪 Enviar notificación de prueba': { fr: '🧪 Envoyer une notification de test', en: '🧪 Send test notification' },
    'Notificación enviada': { fr: 'Notification envoyée', en: 'Notification sent' },
    'Comprueba la barra de tu móvil': { fr: 'Vérifie la barre de ton mobile', en: 'Check your phone’s notification bar' },
    'Tu navegador no soporta notificaciones push. Usa Chrome o Firefox en Android.': { fr: 'Ton navigateur ne prend pas en charge les notifications push. Utilise Chrome ou Firefox sur Android.', en: 'Your browser doesn’t support push notifications. Use Chrome or Firefox on Android.' },
    '✓ Ya están activadas': { fr: '✓ Déjà activées', en: '✓ Already enabled' },
    '✓ Notificaciones activadas': { fr: '✓ Notifications activées', en: '✓ Notifications enabled' },
    'Recibirás alertas de transacciones y seguridad': { fr: 'Tu recevras des alertes de transactions et de sécurité', en: 'You’ll get transaction and security alerts' },
    'Permiso denegado': { fr: 'Autorisation refusée', en: 'Permission denied' },
    'Ve a Configuración del navegador → Permisos → Notificaciones para activarlas': { fr: 'Va dans Réglages du navigateur → Autorisations → Notifications pour les activer', en: 'Go to browser Settings → Permissions → Notifications to enable them' },

    // ── Cuentas bancarias ──
    'Cuentas bancarias': { fr: 'Comptes bancaires', en: 'Bank accounts' },
    '🏦 Cuentas bancarias': { fr: '🏦 Comptes bancaires', en: '🏦 Bank accounts' },
    '🏦 Nuevo banco / cuenta': { fr: '🏦 Nouvelle banque / compte', en: '🏦 New bank / account' },
    '+ Nueva': { fr: '+ Nouvelle', en: '+ New' },
    'Cargando cuentas…': { fr: 'Chargement des comptes…', en: 'Loading accounts…' },
    'Nombre del banco *': { fr: 'Nom de la banque *', en: 'Bank name *' },
    'BGFI Bank, Santander…': { fr: 'BGFI Bank, Santander…', en: 'BGFI Bank, Santander…' },
    'Emoji': { fr: 'Emoji', en: 'Emoji' },
    'Tipo de cuenta *': { fr: 'Type de compte *', en: 'Account type *' },
    'Moneda': { fr: 'Devise', en: 'Currency' },
    'MONEDA': { fr: 'DEVISE', en: 'CURRENCY' },
    'Divisa': { fr: 'Devise', en: 'Currency' },
    'SWIFT / BIC': { fr: 'SWIFT / BIC', en: 'SWIFT / BIC' },
    'SWIFT / Mobile Money': { fr: 'SWIFT / Mobile Money', en: 'SWIFT / Mobile Money' },
    'IBAN / Número de cuenta': { fr: 'IBAN / Numéro de compte', en: 'IBAN / Account number' },
    'Titular': { fr: 'Titulaire', en: 'Account holder' },
    'Nombre completo del titular': { fr: 'Nom complet du titulaire', en: 'Full name of account holder' },
    'Calle, número, ciudad': { fr: 'Rue, numéro, ville', en: 'Street, number, city' },
    'Referencia interna': { fr: 'Référence interne', en: 'Internal reference' },
    'ej: cuenta comisiones GQ': { fr: 'ex : compte commissions GQ', en: 'e.g. GQ fees account' },
    '✓ Guardar banco': { fr: '✓ Enregistrer la banque', en: '✓ Save bank' },
    'Cancelar': { fr: 'Annuler', en: 'Cancel' },
    'Cuenta eliminada': { fr: 'Compte supprimé', en: 'Account deleted' },
    'La cuenta bancaria se ha borrado.': { fr: 'Le compte bancaire a été supprimé.', en: 'The bank account has been deleted.' },
    '🖨️ Imprimir cuentas (PDF)': { fr: '🖨️ Imprimer les comptes (PDF)', en: '🖨️ Print accounts (PDF)' },
    '📲 Compartir cuentas por WhatsApp': { fr: '📲 Partager les comptes via WhatsApp', en: '📲 Share accounts via WhatsApp' },
    'Seleccionar…': { fr: 'Sélectionner…', en: 'Select…' },
    'Selecciona el país primero…': { fr: 'Choisis d’abord le pays…', en: 'Select the country first…' },
    'Selecciona tu banco…': { fr: 'Choisis ta banque…', en: 'Select your bank…' },
    '— Seleccionar —': { fr: '— Sélectionner —', en: '— Select —' },
    '— País —': { fr: '— Pays —', en: '— Country —' },
    '— Ciudad —': { fr: '— Ville —', en: '— City —' },

    // ── Tontinas ──
    'Nueva tontina': { fr: 'Nouvelle tontine', en: 'New tontine' },
    '🤝 Tontinas': { fr: '🤝 Tontines', en: '🤝 Tontines' },
    '🤝 P2P / Tontinas': { fr: '🤝 P2P / Tontines', en: '🤝 P2P / Tontines' },
    '🤝 Crear nueva tontina': { fr: '🤝 Créer une nouvelle tontine', en: '🤝 Create new tontine' },
    '🤝 Crear tontina': { fr: '🤝 Créer la tontine', en: '🤝 Create tontine' },
    'Cargando tontinas…': { fr: 'Chargement des tontines…', en: 'Loading tontines…' },
    'Nombre del grupo': { fr: 'Nom du groupe', en: 'Group name' },
    'Ej: Amigos de Madrid': { fr: 'Ex : Amis de Madrid', en: 'e.g. Madrid friends' },
    'Aportación por turno': { fr: 'Cotisation par tour', en: 'Contribution per round' },
    'Frecuencia': { fr: 'Fréquence', en: 'Frequency' },
    'Semanal': { fr: 'Hebdomadaire', en: 'Weekly' },
    'Quincenal': { fr: 'Bimensuel', en: 'Biweekly' },
    'Mensual': { fr: 'Mensuel', en: 'Monthly' },
    'Número máximo de miembros (2-50)': { fr: 'Nombre maximum de membres (2-50)', en: 'Maximum members (2-50)' },
    'Entre miembros del grupo': { fr: 'Entre membres du groupe', en: 'Among group members' },
    'Transferencias entre usuarios': { fr: 'Transferts entre utilisateurs', en: 'User-to-user transfers' },

    // ── Facturas / servicios ──
    'Proveedor': { fr: 'Fournisseur', en: 'Provider' },
    'Nº de contrato, teléfono, etc.': { fr: 'N° de contrat, téléphone, etc.', en: 'Contract no., phone, etc.' },
    'Importe': { fr: 'Montant', en: 'Amount' },
    'Importe (XAF)': { fr: 'Montant (XAF)', en: 'Amount (XAF)' },
    '🧾 Pagar ahora': { fr: '🧾 Payer maintenant', en: '🧾 Pay now' },

    // ── Seguros ──
    'Planes disponibles': { fr: 'Formules disponibles', en: 'Available plans' },
    'Cargando planes…': { fr: 'Chargement des formules…', en: 'Loading plans…' },
    'Tipo de seguro': { fr: 'Type d’assurance', en: 'Insurance type' },
    '¿Ya tienes un seguro?': { fr: 'Tu as déjà une assurance ?', en: 'Do you already have insurance?' },
    'Declarar siniestro': { fr: 'Déclarer un sinistre', en: 'File a claim' },
    '📋 Declarar siniestro': { fr: '📋 Déclarer un sinistre', en: '📋 File a claim' },
    'Descripción del incidente': { fr: 'Description de l’incident', en: 'Incident description' },
    'Describe lo que ocurrió...': { fr: 'Décris ce qui s’est passé...', en: 'Describe what happened...' },
    'Importe reclamado': { fr: 'Montant réclamé', en: 'Claimed amount' },
    '🛡️ Enviar declaración': { fr: '🛡️ Envoyer la déclaration', en: '🛡️ Submit claim' },
    'Siniestro enviado': { fr: 'Sinistre envoyé', en: 'Claim submitted' },
    'Tu declaración está en revisión': { fr: 'Ta déclaration est en cours d’examen', en: 'Your claim is under review' },

    // ── Inversión ──
    'Fondos disponibles': { fr: 'Fonds disponibles', en: 'Available funds' },
    'Cargando fondos…': { fr: 'Chargement des fonds…', en: 'Loading funds…' },
    'Fondo': { fr: 'Fonds', en: 'Fund' },
    '¿Cuánto quieres invertir?': { fr: 'Combien veux-tu investir ?', en: 'How much do you want to invest?' },
    '📊 Invertir ahora': { fr: '📊 Investir maintenant', en: '📊 Invest now' },

    // ── Ahorro ──
    'Nueva meta': { fr: 'Nouvel objectif', en: 'New goal' },
    'Cargando metas…': { fr: 'Chargement des objectifs…', en: 'Loading goals…' },
    '🎯 Nueva meta de ahorro': { fr: '🎯 Nouvel objectif d’épargne', en: '🎯 New savings goal' },
    '🎯 Crear meta': { fr: '🎯 Créer l’objectif', en: '🎯 Create goal' },
    'Nombre de la meta': { fr: 'Nom de l’objectif', en: 'Goal name' },
    'Ej: Vacaciones en Ghana': { fr: 'Ex : Vacances au Ghana', en: 'e.g. Holidays in Ghana' },
    'Objetivo': { fr: 'Objectif', en: 'Target' },
    'Fecha límite (opcional)': { fr: 'Date limite (facultatif)', en: 'Deadline (optional)' },
    'Ahorro automático por mes (opcional)': { fr: 'Épargne automatique par mois (facultatif)', en: 'Automatic monthly saving (optional)' },

    // ── Tarjetas ──
    'Nueva tarjeta': { fr: 'Nouvelle carte', en: 'New card' },
    'Cargando tarjetas…': { fr: 'Chargement des cartes…', en: 'Loading cards…' },
    '💳 Crear tarjeta': { fr: '💳 Créer la carte', en: '💳 Create card' },
    '💳 Crear tarjeta virtual': { fr: '💳 Créer une carte virtuelle', en: '💳 Create virtual card' },
    'Nombre de la tarjeta': { fr: 'Nom de la carte', en: 'Card name' },
    'Ej: Compras online': { fr: 'Ex : Achats en ligne', en: 'e.g. Online shopping' },
    'Límite de gasto (opcional)': { fr: 'Limite de dépense (facultatif)', en: 'Spending limit (optional)' },
    'Sin límite': { fr: 'Sans limite', en: 'No limit' },
    '💳 Tarjeta Visa/Mastercard virtual — úsala online en cualquier tienda del mundo': { fr: '💳 Carte Visa/Mastercard virtuelle — utilise-la en ligne dans n’importe quelle boutique', en: '💳 Virtual Visa/Mastercard — use it online at any store worldwide' },

    // ── POS ──
    'Importe a cobrar ': { fr: 'Montant à encaisser ', en: 'Amount to charge ' },
    '🏪 Acepta pagos en tu negocio — genera QR de cobro al instante para cualquier importe': { fr: '🏪 Accepte les paiements dans ton commerce — génère un QR d’encaissement instantané pour tout montant', en: '🏪 Accept payments in your business — generate an instant payment QR for any amount' },
    'Introduce un importe primero': { fr: 'Saisis d’abord un montant', en: 'Enter an amount first' },

    // ── InnovaBot / soporte ──
    '🤖 InnovaBot': { fr: '🤖 InnovaBot', en: '🤖 InnovaBot' },
    'Escribe tu pregunta…': { fr: 'Écris ta question…', en: 'Type your question…' },
    'Escribe tu mensaje…': { fr: 'Écris ton message…', en: 'Type your message…' },
    '¿En qué te puedo ayudar?': { fr: 'Comment puis-je t’aider ?', en: 'How can I help you?' },
    '¡Hola! Soy InnovaBot, tu asistente 24/7. Puedo ayudarte con:': { fr: 'Salut ! Je suis InnovaBot, ton assistant 24/7. Je peux t’aider avec :', en: 'Hi! I’m InnovaBot, your 24/7 assistant. I can help you with:' },
    '❓ Preguntas frecuentes': { fr: '❓ Questions fréquentes', en: '❓ Frequently asked questions' },
    '💬 Soporte humano · Lun–Vie 8:00–18:00 WAT · soporte@innovaafric.com': { fr: '💬 Support humain · Lun–Ven 8h–18h WAT · soporte@innovaafric.com', en: '💬 Human support · Mon–Fri 8:00–18:00 WAT · soporte@innovaafric.com' },
    'Inicia sesión ': { fr: 'Connecte-toi ', en: 'Log in ' },
    'Necesitas iniciar sesión para escribir a soporte': { fr: 'Tu dois te connecter pour écrire au support', en: 'You need to log in to message support' },

    // ── Fiscal ──
    'Impuestos — Hacienda': { fr: 'Impôts — Fisc', en: 'Taxes — Revenue' },
    'Calculadora fiscal en vivo': { fr: 'Calculatrice fiscale en direct', en: 'Live tax calculator' },
    'Comisiones de la plataforma': { fr: 'Commissions de la plateforme', en: 'Platform fees' },
    'Resumen fiscal del período': { fr: 'Résumé fiscal de la période', en: 'Period tax summary' },
    'Cargando resumen…': { fr: 'Chargement du résumé…', en: 'Loading summary…' },
    'Cargando impuestos…': { fr: 'Chargement des impôts…', en: 'Loading taxes…' },
    'IMPORTE BASE': { fr: 'MONTANT DE BASE', en: 'BASE AMOUNT' },
    'Importe base': { fr: 'Montant de base', en: 'Base amount' },
    'TIPO DE OPERACIÓN': { fr: 'TYPE D’OPÉRATION', en: 'OPERATION TYPE' },
    'Envío (2%)': { fr: 'Envoi (2 %)', en: 'Transfer (2%)' },
    'Retiro (1,5%)': { fr: 'Retrait (1,5 %)', en: 'Withdrawal (1.5%)' },
    'Cambio (0,5%)': { fr: 'Change (0,5 %)', en: 'Exchange (0.5%)' },
    'P2P (0%)': { fr: 'P2P (0 %)', en: 'P2P (0%)' },
    'Comisión InnovaAFRIC': { fr: 'Commission InnovaAFRIC', en: 'InnovaAFRIC fee' },
    'Total deducciones': { fr: 'Total des déductions', en: 'Total deductions' },
    'Importe neto': { fr: 'Montant net', en: 'Net amount' },
    'Introduce un importe': { fr: 'Saisis un montant', en: 'Enter an amount' },
    'Introduce un importe para calcular': { fr: 'Saisis un montant pour calculer', en: 'Enter an amount to calculate' },
    '⚡ Calcular': { fr: '⚡ Calculer', en: '⚡ Calculate' },
    '🖨️ Imprimir PDF': { fr: '🖨️ Imprimer PDF', en: '🖨️ Print PDF' },
    '🖨️ Informe fiscal completo (PDF)': { fr: '🖨️ Rapport fiscal complet (PDF)', en: '🖨️ Full tax report (PDF)' },
    '📲 Compartir informe fiscal por WhatsApp': { fr: '📲 Partager le rapport fiscal via WhatsApp', en: '📲 Share tax report via WhatsApp' },
    '💸 Envío de dinero': { fr: '💸 Envoi d’argent', en: '💸 Money transfer' },
    '🔄 Cambio de divisa': { fr: '🔄 Change de devise', en: '🔄 Currency exchange' },
    '💸 Tasas de cambio': { fr: '💸 Taux de change', en: '💸 Exchange rates' },
    '💸 Transacciones': { fr: '💸 Transactions', en: '💸 Transactions' },
    '📊 Estado de transacciones': { fr: '📊 État des transactions', en: '📊 Transaction status' },

    // ── Wallet / extractos ──
    'Todos': { fr: 'Tous', en: 'All' },
    'Enviados': { fr: 'Envoyés', en: 'Sent' },
    'Recibidos': { fr: 'Reçus', en: 'Received' },
    'Compras': { fr: 'Achats', en: 'Purchases' },
    'Cargando movimientos…': { fr: 'Chargement des mouvements…', en: 'Loading activity…' },
    'Sin cobros aún': { fr: 'Aucun encaissement pour l’instant', en: 'No receipts yet' },
    '🖨️ Imprimir extracto (PDF)': { fr: '🖨️ Imprimer le relevé (PDF)', en: '🖨️ Print statement (PDF)' },
    '📲 Compartir extracto por WhatsApp': { fr: '📲 Partager le relevé via WhatsApp', en: '📲 Share statement via WhatsApp' },

    // ── Mapa / cerca de mí ──
    '📍 Cerca de mí': { fr: '📍 Près de moi', en: '📍 Near me' },
    '📍 Tú': { fr: '📍 Toi', en: '📍 You' },
    '⚡ Circulares': { fr: '⚡ Circulaires', en: '⚡ Circulars' },
    '🏪 Comercios': { fr: '🏪 Commerces', en: '🏪 Merchants' },
    '🛵 Riders': { fr: '🛵 Livreurs', en: '🛵 Riders' },
    'Hacer entregas': { fr: 'Faire des livraisons', en: 'Make deliveries' },

    // ── Cámara / QR errores ──
    'Cámara no disponible': { fr: 'Caméra non disponible', en: 'Camera not available' },
    'Tu navegador no permite la cámara. Introduce el código a mano.': { fr: 'Ton navigateur n’autorise pas la caméra. Saisis le code à la main.', en: 'Your browser doesn’t allow the camera. Enter the code manually.' },
    'Escáner no disponible': { fr: 'Scanner non disponible', en: 'Scanner not available' },
    'No se pudo cargar el lector QR. Introduce el código a mano.': { fr: 'Impossible de charger le lecteur QR. Saisis le code à la main.', en: 'Could not load the QR reader. Enter the code manually.' },
    'No se pudo acceder a la cámara. Introduce el código a mano.': { fr: 'Impossible d’accéder à la caméra. Saisis le code à la main.', en: 'Could not access the camera. Enter the code manually.' },

    // ── Genéricos / estados de carga ──
    'Carga inicial': { fr: 'Chargement initial', en: 'Initial load' },
    'Cargando servicios…': { fr: 'Chargement des services…', en: 'Loading services…' },
    'Error': { fr: 'Erreur', en: 'Error' },
    'Error de conexión': { fr: 'Erreur de connexion', en: 'Connection error' },
    'KYC requerido para activar pagos.': { fr: 'KYC requis pour activer les paiements.', en: 'KYC required to enable payments.' },
    '¡Bienvenido/a!': { fr: 'Bienvenue !', en: 'Welcome!' },
    'Cuenta creada. Completa el KYC para activar pagos.': { fr: 'Compte créé. Complète le KYC pour activer les paiements.', en: 'Account created. Complete KYC to enable payments.' },
    '(automático por país)': { fr: '(automatique selon le pays)', en: '(automatic by country)' },
    '💱 Moneda asignada:': { fr: '💱 Devise attribuée :', en: '💱 Assigned currency:' },

    // ── Panel de ajustes ──
    'Idioma': { fr: 'Langue', en: 'Language' },
    'Tema': { fr: 'Thème', en: 'Theme' },
    'Modo claro': { fr: 'Mode clair', en: 'Light mode' },
    'Seguridad': { fr: 'Sécurité', en: 'Security' },
    // ── Faltantes detectados en el re-escaneo ──
    'Bloqueado': { fr: 'Bloqué', en: 'Blocked' },
    'Copiar': { fr: 'Copier', en: 'Copy' },
    'Número de referencia / cuenta': { fr: 'Numéro de référence / compte', en: 'Reference / account number' },
    'Verificada': { fr: 'Vérifiée', en: 'Verified' },
    'Pendiente': { fr: 'En attente', en: 'Pending' },
    'Eliminar': { fr: 'Supprimer', en: 'Delete' },
    '🛡️ Cobertura tricontinental — salud, viaje, móvil y más. Activa al instante, sin papeleo.': { fr: '🛡️ Couverture tricontinentale — santé, voyage, mobile et plus. Activation instantanée, sans paperasse.', en: '🛡️ Tricontinental coverage — health, travel, mobile and more. Instant activation, no paperwork.' },
    '📲 Toca "Añadir a pantalla de inicio" para instalar la app': { fr: '📲 Touche « Ajouter à l’écran d’accueil » pour installer l’app', en: '📲 Tap "Add to Home Screen" to install the app' },
    // ── Chat de reparto (demo) ──
    '📍 Rider llega en': { fr: '📍 Le livreur arrive dans', en: '📍 Rider arrives in' },
    '🟢 En camino · 8 min': { fr: '🟢 En route · 8 min', en: '🟢 On the way · 8 min' },
    '📦 Moussa ha recogido tu pedido': { fr: '📦 Moussa a récupéré ta commande', en: '📦 Moussa has picked up your order' },
    '¡Hola! Ya recogí tu paquete. Estoy en camino, llegaré en unos 8 minutos aprox 🛵': { fr: 'Salut ! J’ai récupéré ton colis. Je suis en route, j’arrive dans 8 minutes environ 🛵', en: 'Hi! I’ve picked up your package. I’m on the way, arriving in about 8 minutes 🛵' },
    '¡Perfecto! El edificio azul frente a la farmacia, 2ª planta. ¡Gracias!': { fr: 'Parfait ! Le bâtiment bleu en face de la pharmacie, 2e étage. Merci !', en: 'Perfect! The blue building across from the pharmacy, 2nd floor. Thanks!' },
    'Entendido, te aviso cuando llegue 👌': { fr: 'Compris, je te préviens quand j’arrive 👌', en: 'Got it, I’ll let you know when I arrive 👌' },
    'Entregado en Bastos, Yaoundé': { fr: 'Livré à Bastos, Yaoundé', en: 'Delivered in Bastos, Yaoundé' },

    // ── Préstamos ──
    'Préstamos': { fr: 'Prêts', en: 'Loans' },
    'Solicita un microcrédito para tu negocio o emergencias. Interés desde el 5%. Un préstamo activo a la vez.': { fr: 'Demande un microcrédit pour ton commerce ou tes urgences. Intérêt à partir de 5 %. Un seul prêt actif à la fois.', en: 'Request a microloan for your business or emergencies. Interest from 5%. One active loan at a time.' },
    'Cargando préstamos…': { fr: 'Chargement des prêts…', en: 'Loading loans…' },
    '🏦 Solicitar préstamo': { fr: '🏦 Demander un prêt', en: '🏦 Request a loan' },
    'Solicitar préstamo': { fr: 'Demander un prêt', en: 'Request a loan' },
    '¿Cuánto necesitas?': { fr: 'Combien te faut-il ?', en: 'How much do you need?' },
    'Finalidad': { fr: 'Objet', en: 'Purpose' },
    'Negocio': { fr: 'Commerce', en: 'Business' },
    'Reposición de stock': { fr: 'Réapprovisionnement', en: 'Restock' },
    'Equipamiento': { fr: 'Équipement', en: 'Equipment' },
    'Personal': { fr: 'Personnel', en: 'Personal' },
    'Emergencia': { fr: 'Urgence', en: 'Emergency' },
    'Cuéntanos para qué lo necesitas': { fr: 'Dis-nous à quoi il servira', en: 'Tell us what it’s for' },
    '📄 Tu solicitud pasará a revisión. Si se aprueba, el importe se abona en tu saldo XenderMoney. El plazo por defecto es de 30 días.': { fr: '📄 Ta demande passera en révision. Si elle est approuvée, le montant est crédité sur ton solde XenderMoney. Le délai par défaut est de 30 jours.', en: '📄 Your request will be reviewed. If approved, the amount is credited to your XenderMoney balance. Default term is 30 days.' },
    '🏦 Enviar solicitud': { fr: '🏦 Envoyer la demande', en: '🏦 Submit request' },
    'No tienes préstamos aún.': { fr: 'Tu n’as pas encore de prêt.', en: 'You have no loans yet.' },
    'Solicitud enviada': { fr: 'Demande envoyée', en: 'Request submitted' },
    'En revisión': { fr: 'En révision', en: 'Under review' },
    'Aprobado': { fr: 'Approuvé', en: 'Approved' },
    'Desembolsado': { fr: 'Décaissé', en: 'Disbursed' },
    'Devuelto': { fr: 'Remboursé', en: 'Repaid' },
    'Rechazado': { fr: 'Rejeté', en: 'Rejected' },

    // ── Países (selectores) ──
    'Guinea Ecuatorial': { fr: 'Guinée équatoriale', en: 'Equatorial Guinea' },
    'Camerún': { fr: 'Cameroun', en: 'Cameroon' },
    'Senegal': { fr: 'Sénégal', en: 'Senegal' },
    'España': { fr: 'Espagne', en: 'Spain' },
    'Francia': { fr: 'France', en: 'France' },
    '🇬🇶 Guinea Ecuatorial': { fr: '🇬🇶 Guinée équatoriale', en: '🇬🇶 Equatorial Guinea' },
    '🇨🇲 Camerún': { fr: '🇨🇲 Cameroun', en: '🇨🇲 Cameroon' },
    '🇸🇳 Senegal': { fr: '🇸🇳 Sénégal', en: '🇸🇳 Senegal' },
    '🇨🇮 Costa de Marfil': { fr: '🇨🇮 Côte d’Ivoire', en: '🇨🇮 Ivory Coast' },
    '🇬🇭 Ghana': { fr: '🇬🇭 Ghana', en: '🇬🇭 Ghana' },
    '🇳🇬 Nigeria': { fr: '🇳🇬 Nigéria', en: '🇳🇬 Nigeria' },
    '🇬🇦 Gabón': { fr: '🇬🇦 Gabon', en: '🇬🇦 Gabon' },
    '🇨🇩 Congo RD': { fr: '🇨🇩 RD Congo', en: '🇨🇩 DR Congo' },
    '🇨🇩 Congo RDC': { fr: '🇨🇩 RDC', en: '🇨🇩 DRC' },
    '🇬🇳 Guinea': { fr: '🇬🇳 Guinée', en: '🇬🇳 Guinea' },
    '🇪🇸 España': { fr: '🇪🇸 Espagne', en: '🇪🇸 Spain' },
    '🇫🇷 Francia': { fr: '🇫🇷 France', en: '🇫🇷 France' },
    '🇩🇪 Alemania': { fr: '🇩🇪 Allemagne', en: '🇩🇪 Germany' },
    '🇬🇧 Reino Unido': { fr: '🇬🇧 Royaume-Uni', en: '🇬🇧 United Kingdom' },
    '🇲🇦 Marruecos': { fr: '🇲🇦 Maroc', en: '🇲🇦 Morocco' },
    '🇮🇹 Italia': { fr: '🇮🇹 Italie', en: '🇮🇹 Italy' },
    '🇵🇹 Portugal': { fr: '🇵🇹 Portugal', en: '🇵🇹 Portugal' },
    '🇧🇪 Bélgica': { fr: '🇧🇪 Belgique', en: '🇧🇪 Belgium' },
    '🇧🇫 Burkina Faso': { fr: '🇧🇫 Burkina Faso', en: '🇧🇫 Burkina Faso' },
    '🇧🇯 Benín': { fr: '🇧🇯 Bénin', en: '🇧🇯 Benin' },
    '🇲🇱 Mali': { fr: '🇲🇱 Mali', en: '🇲🇱 Mali' },
    '🇹🇬 Togo': { fr: '🇹🇬 Togo', en: '🇹🇬 Togo' }
  };

  let lang = localStorage.getItem('ia_lang') || 'es';

  function trText(node) {
    if (node.__orig === undefined) node.__orig = node.nodeValue;
    const orig = node.__orig;
    const t = orig.trim();
    if (!t) return;
    const e = D[t];
    if (!e) return;
    const out = lang === 'es' ? t : (e[lang] || t);
    const val = orig.replace(t, out);
    if (node.nodeValue !== val) node.nodeValue = val;
  }

  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { trText(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9) return;
    const it = document.createNodeIterator(root, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = it.nextNode())) trText(n);
    const els = root.querySelectorAll ? root.querySelectorAll('[placeholder]') : [];
    els.forEach(el => {
      if (el.__origPh === undefined) el.__origPh = el.placeholder;
      const e = D[el.__origPh.trim()];
      el.placeholder = e ? (lang === 'es' ? el.__origPh : (e[lang] || el.__origPh)) : el.__origPh;
    });
  }

  function apply() {
    walk(document.body);
    updateBtn();
    // Permite a la app re-pintar contenido dinámico (composites que no casan
    // por diccionario, p. ej. "Desde €X · N productos") al cambiar de idioma.
    if (typeof window.iaOnLangChange === 'function') {
      try { window.iaOnLangChange(lang); } catch (e) {}
    }
  }

  function updateBtn() {
    var lbl = '🌐 ' + lang.toUpperCase();
    document.querySelectorAll('.ia-lang-hdr, #ia-lang-btn').forEach(function (e) { e.textContent = lbl; });
  }

  // API global: la app cambia idioma desde su botón de la barra superior
  window.iaCycleLang = function () {
    lang = lang === 'es' ? 'fr' : lang === 'fr' ? 'en' : 'es';
    localStorage.setItem('ia_lang', lang);
    apply();
  };
  window.iaSetLang = function (l) {
    if (['es', 'fr', 'en'].indexOf(l) === -1) return;
    lang = l; localStorage.setItem('ia_lang', lang); apply();
  };
  window.iaGetLang = function () { return lang; };
  // Helper para textos que la app construye dinámicamente (composites tipo
  // "Desde €X · N productos"): la app llama iaT('es','fr','en') al renderizar.
  window.iaT = function (es, fr, en) {
    return lang === 'fr' ? (fr != null ? fr : es) : lang === 'en' ? (en != null ? en : es) : es;
  };

  function makeBtn() {
    // Si la app ya tiene su botón de idioma (.ia-lang-hdr), no creamos el flotante
    if (document.querySelector('.ia-lang-hdr')) { updateBtn(); return; }
    var btn = document.createElement('button');
    btn.id = 'ia-lang-btn';
    btn.style.cssText = 'position:fixed;bottom:92px;right:12px;z-index:2000;background:#121826;color:#29ABE2;' +
      'border:1px solid #232d42;border-radius:20px;padding:8px 13px;font-size:12px;font-weight:700;cursor:pointer;' +
      'box-shadow:0 2px 10px rgba(0,0,0,.4)';
    btn.onclick = window.iaCycleLang;
    document.body.appendChild(btn);
    updateBtn();
  }

  function start() {
    makeBtn();
    apply();
    // traduce también lo que la app pinta dinámicamente (listas, toasts, tarjetas)
    new MutationObserver(muts => {
      if (lang === 'es') return;
      muts.forEach(m => m.addedNodes.forEach(nd => walk(nd)));
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
