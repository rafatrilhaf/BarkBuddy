import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { NativeModules, Platform } from 'react-native';

const translations = {
  pt: {
    // Navegação
    'nav.dashboard': 'Dashboard',
    'nav.maps': 'Mapas',
    'nav.pets': 'Pets',
    'nav.blog': 'Blog',
    'nav.tutor': 'Tutor',
    'nav.settings': 'Configurações',
    'nav.agenda': 'Agenda',
    'nav.about': 'Sobre',

    // Geral
    'general.save': 'Salvar',
    'general.cancel': 'Cancelar',
    'general.loading': 'Carregando...',
    'general.error': 'Erro',
    'general.success': 'Sucesso',
    'general.edit': 'Editar',
    'general.confirm': 'Confirmar',
    'general.delete': 'Excluir',
    'general.add': 'Adicionar',
    'general.filter': 'Filtro',
    'general.apply': 'Aplicar',
    'general.clear': 'Limpar',
    'general.close': 'Fechar',
    'general.years': 'anos',

    // Tutor
    'tutor.name': 'Nome',
    'tutor.phone': 'Telefone', 
    'tutor.address': 'Endereço',
    'tutor.email': 'Email',

    // Agenda
    'agenda.title': 'Agenda',
    'agenda.newReminder': 'Novo Lembrete',
    'agenda.editReminder': 'Editar Lembrete',
    'agenda.reminderTitle': 'Título',
    'agenda.reminderDescription': 'Descrição',
    'agenda.selectPet': 'Selecionar Pet',
    'agenda.selectCategory': 'Selecionar Categoria',
    'agenda.selectDate': 'Selecionar Data',
    'agenda.selectTime': 'Selecionar Hora',
    'agenda.notification': 'Notificação',
    'agenda.completed': 'Concluído',
    'agenda.pending': 'Pendente',
    'agenda.noReminders': 'Nenhum lembrete para esta data',
    'agenda.deleteConfirm': 'Deseja realmente excluir este lembrete?',
    'agenda.reminderSaved': 'Lembrete salvo com sucesso!',
    'agenda.reminderDeleted': 'Lembrete excluído!',
    'agenda.filters': 'Filtros da Agenda',
    'agenda.showCompleted': 'Mostrar Concluídos',
    'agenda.notesOfDay': 'Notas do dia',
    'agenda.noNotes': 'Nenhuma nota para esta data',

    // Categorias da Agenda
    'category.consulta': 'Consulta',
    'category.medicacao': 'Medicação',
    'category.banho': 'Banho',
    'category.exercicio': 'Exercício',
    'category.alimentacao': 'Alimentação',
    'category.outro': 'Outro',

    // Configurações
    'settings.title': 'Configurações',
    'settings.appearance': 'Aparência',
    'settings.theme': 'Tema',
    'settings.language': 'Idioma',
    'settings.accessibility': 'Acessibilidade',
    'settings.fontSize': 'Tamanho da Fonte',
    'settings.account': 'Conta',
    'settings.support': 'Suporte',
    'settings.help': 'Ajuda',
    'settings.about': 'Sobre',
    
    // Temas
    'theme.light': 'Claro',
    'theme.dark': 'Escuro',
    'theme.system': 'Sistema',
    
    // Tamanhos de fonte
    'fontSize.small': 'Pequeno',
    'fontSize.medium': 'Médio',
    'fontSize.large': 'Grande',

    // Autenticação
    'auth.logout': 'Sair',
    'auth.logoutConfirm': 'Deseja realmente sair da sua conta?',
    'auth.logoutError': 'Não foi possível sair. Tente novamente.',

    // Botões
    'button.ok': 'OK',
    'button.yes': 'Sim',
    'button.no': 'Não',

    // Status de Pets
    'pet.status.safe': 'SEGURO',
    'pet.status.missing': 'DESAPARECIDO',

    // ================== VALIDAÇÕES E ERROS ==================
    'validation.titleRequired': 'Título é obrigatório',
    'validation.petRequired': 'Selecione um pet',

    // ================== COMPONENTS ==================
    // PostCard
    'components.postCard.comment': 'Comentar',
    'components.postCard.share': 'Compartilhar',
    'components.postCard.publishedToday': 'publicado hoje às',
    'components.postCard.comments': 'Comentários',
    'components.postCard.noCommentsYet': 'Nenhum comentário ainda',
    'components.postCard.firstToComment': 'Seja o primeiro a comentar!',
    'components.postCard.reply': 'Responder',
    'components.postCard.replyingTo': 'Respondendo comentário',
    'components.postCard.writeComment': 'Escreva um comentário...',
    'components.postCard.writeReply': 'Escreva uma resposta...',
    'components.postCard.loginRequired': 'Login necessário',
    'components.postCard.loginToComment': 'Faça login para comentar',
    'components.postCard.loginToReply': 'Faça login para responder',
    'components.postCard.writeCommentError': 'Digite um comentário',
    'components.postCard.writeReplyError': 'Digite uma resposta',
    'components.postCard.commentSendError': 'Falha ao enviar comentário',
    'components.postCard.replySendError': 'Falha ao enviar resposta',
    'components.postCard.shareMessage': '🐾 Confira este post do BarkBuddy:\n\n"{text}"\n\n📝 Compartilhado por: {author}\n\nBaixe o BarkBuddy e junte-se à nossa comunidade de tutores! 🎯',
    'components.postCard.shareTitle': 'Post do BarkBuddy 🐾',
    'components.postCard.shareSuccess': 'Post compartilhado com sucesso!',
    'components.postCard.shareError': 'Não foi possível compartilhar este post',
    'components.postCard.commentCount': '{count} comentário',
    'components.postCard.commentCountPlural': '{count} comentários',

    // PetCard
    'components.petCard.foundYourPet': 'Achei seu pet!',
    'components.petCard.viewDetails': 'Ver detalhes',

    // MapWeb
    'components.mapWeb.nativeMapUnavailable': 'Mapa nativo indisponível no Web. Abra no Android/iOS.',

    // ListaNotas
    'components.notes.noNotesForDate': 'Nenhuma nota para esta data.',

    // ModalLembrete
    'components.modalLembrete.pet': 'Pet',

    // FiltrosAgenda  
    'components.filters.title': 'Filtros da Agenda',
    'components.filters.pets': 'Pets',
    'components.filters.categories': 'Categorias',
    'components.filters.clear': 'Limpar',
    'components.filters.apply': 'Aplicar',

    // ================== MAPAS/LOCALIZAÇÃO ==================
    'maps.title': 'Localização',
    'maps.selectPet': 'Selecione um pet',
    'maps.found': '✅ Encontrado',
    'maps.lost': '🚨 Perdido',
    'maps.markAsFound': '❌ Encontrado',
    'maps.markAsLost': '🚨 Perdido',
    'maps.newSafeZone': 'Nova Zona',
    'maps.tapOnMap': 'Toque no mapa',
    'maps.manage': 'Gerenciar',
    'maps.zones': 'zonas',
    'maps.zone': 'zona',
    'maps.createSafeZone': 'Criar Zona Segura',
    'maps.createSafeZoneDesc': 'Toque no mapa para definir o centro da zona segura.',
    'maps.petSafe': '🏠 Em zona segura',
    'maps.petOutside': '⚠️ Fora das zonas',
    'maps.petLost': '🚨 Pet perdido',
    'maps.noLocation': 'Sem localização ainda',
    'maps.lastSeen': 'Última vez visto',
    'maps.inZone': '🏠 Em',
    'maps.outsideZones': '📍 Fora das zonas',
    'maps.ago': 'atrás',
    'maps.justNow': 'Agora mesmo',
    'maps.minutesAgo': 'min atrás',
    'maps.hoursAgo': 'h atrás',
    'maps.daysAgo': 'dias atrás',
    'maps.never': 'Nunca',
    'maps.refresh': 'Atualizar',
    'maps.center': 'Centralizar',
    'maps.centered': 'Centralizado',
    'maps.open': 'Abrir',
    'maps.realTime': 'Tempo real (1 min)',
    'maps.stopRealTime': 'Parar tempo real (1 min)',
    'maps.loadingMap': 'Carregando mapa...',
    'maps.appleCredit': 'Mapas fornecidos pela Apple',
    'maps.osmCredit': 'Mapa fornecido por OpenStreetMap',
    
    // Modais de zona
    'maps.newSafeZoneTitle': 'Nova Zona Segura',
    'maps.zoneName': 'Nome da zona:',
    'maps.zoneNamePlaceholder': 'Ex: Casa, Parque, Veterinário',
    'maps.zoneRadius': 'Raio da zona',
    'maps.zoneColor': 'Cor da zona:',
    'maps.createZone': 'Criar Zona',
    'maps.safeZones': 'Zonas Seguras',
    'maps.noZonesCreated': 'Nenhuma zona criada',
    'maps.noZonesDesc': 'Crie zonas seguras para monitorar automaticamente quando seu pet entra ou sai de áreas importantes',
    'maps.radiusMeters': 'm de raio',
    'maps.close': 'Fechar',
    
    // Alertas e confirmações
    'maps.markAsFoundTitle': 'Marcar como encontrado',
    'maps.markAsLostTitle': 'Marcar como perdido',
    'maps.markAsFoundConfirm': 'Deseja marcar {petName} como encontrado?',
    'maps.markAsLostConfirm': 'Deseja marcar {petName} como perdido?',
    'maps.statusUpdated': '{petName} marcado como {status}.',
    'maps.statusUpdateError': 'Não foi possível atualizar o status.',
    'maps.deleteZone': 'Excluir zona',
    'maps.deleteZoneConfirm': 'Tem certeza que deseja excluir a zona "{zoneName}"?\n\nEsta ação não pode ser desfeita.',
    'maps.zoneDeleted': 'Zona excluída!',
    'maps.zoneDeleteError': 'Não foi possível excluir:',
    'maps.petEnteredZone': '🟢 Pet entrou na zona segura',
    'maps.petEnteredZoneDesc': '{petName} entrou na zona "{zoneName}"',
    'maps.petLeftZone': '🔴 Pet saiu da zona segura',
    'maps.petLeftZoneDesc': '{petName} saiu da zona "{zoneName}"',
    'maps.zoneCreatedSuccess': '✅ Sucesso',
    'maps.zoneCreatedDesc': 'Zona "{zoneName}" criada com sucesso!',
    'maps.zoneSaveError': '❌ Erro',
    'maps.zoneSaveErrorDesc': 'Falha ao salvar zona:',
    'maps.provideZoneName': 'Informe um nome para a zona.',
    
    // Estados de erro/carregamento
    'maps.loginRequired': 'Faça login para ver seus pets',
    'maps.noUserFound': 'Não encontramos um usuário autenticado.',
    'maps.noPetsTitle': 'Nenhum pet cadastrado',
    'maps.noPetsDesc': 'Cadastre um pet para começar a acompanhar a localização.',
    'maps.locationError': '❌ Erro GPS',
    'maps.locationErrorDesc': 'Não foi possível obter a localização. Verifique se o GPS está ativado.',
    'maps.permissionRequired': 'Permissão necessária',
    'maps.permissionRequiredDesc': 'Autorize o acesso à localização para rastrear seu pet.',
    'maps.noLocationForPet': 'Sem localização',
    'maps.noLocationForPetDesc': 'Não há localização disponível para este pet.',
    
    // Opções de mapas externos
    'maps.openMap': 'Abrir mapa',
    'maps.chooseMapApp': 'Escolha onde abrir a localização:',
    'maps.googleMaps': 'Google Maps',
    'maps.openStreetMap': 'OpenStreetMap',
    'maps.waze': 'Waze',
    
    // Cores das zonas
    'maps.colorGreen': 'Verde',
    'maps.colorBlue': 'Azul',
    'maps.colorRed': 'Vermelho',
    'maps.colorYellow': 'Amarelo',
    'maps.colorPurple': 'Roxo',
    'maps.colorPink': 'Rosa',

    // WebView - Popup messages
    'maps.petHere': 'Seu pet está aqui!',
    'maps.zoneLabel': 'Zona:',

    // ================== PETS ==================
    'pets.title': 'Meus Pets',
    'pets.addPet': '+ Adicionar um pet',
    'pets.addPetTitle': 'Adicionar pet',
    'pets.editPetTitle': 'Editar pet',
    'pets.noPetsYet': 'Nenhum pet cadastrado ainda.',
    'pets.quickActions': 'Ações rápidas',
    
    // Formulário de pet
    'pets.name': 'Nome',
    'pets.nameRequired': 'Nome *',
    'pets.species': 'Espécie (cão, gato...)',
    'pets.breed': 'Raça',
    'pets.age': 'Idade (anos)',
    'pets.photo': 'Foto',
    'pets.choosePhoto': 'Escolher foto',
    'pets.changePhoto': 'Trocar foto',
    'pets.removePhoto': 'Remover foto',
    'pets.saveChanges': 'Salvar alterações',
    
    // Informações do pet
    'pets.speciesLabel': 'Espécie:',
    'pets.breedLabel': 'Raça:',
    'pets.ageLabel': 'Idade:',
    'pets.addCollar': '🔗 Adicionar Coleira',
    
    // Alertas e confirmações
    'pets.loginRequired': 'Faça login',
    'pets.loginRequiredDesc': 'Você precisa estar logado para gerenciar seus pets.',
    'pets.nameRequiredAlert': 'Nome obrigatório',
    'pets.nameRequiredAlertDesc': 'Informe o nome do pet.',
    'pets.photoUploadError': 'Erro ao enviar foto',
    'pets.photoUploadRetry': 'Tente novamente.',
    'pets.saveFailed': 'Falha ao salvar pet',
    'pets.deletePet': 'Excluir pet',
    'pets.deletePetConfirm': 'Tem certeza que deseja excluir este pet?',
    'pets.removePhotoTitle': 'Remover foto',
    'pets.removePhotoConfirm': 'Deseja remover a foto selecionada?',
    'pets.removePhotoAction': 'Remover',
    'pets.permissionRequired': 'Permissão necessária',
    'pets.permissionRequiredDesc': 'Autorize o acesso às fotos.',
    'pets.noPetsModal': 'Nenhum pet',
    
    // Dashboard
    'pets.dashboard': 'Dashboard',
    'pets.dashboardDesc': 'Veja suas notas e os gráficos do seu pet.',
    'pets.openDashboard': 'Abrir Dashboard',
    
    // Speed dial labels e ações
    'pets.walk': 'Caminhada',
    'pets.weight': 'Peso',
    'pets.health': 'Saúde',
    'pets.note': 'Nota',
    
    // Modais de registros
    'pets.recordWalk': 'Registrar caminhada',
    'pets.recordWeight': 'Registrar peso',
    'pets.recordHealth': 'Registrar evento de saúde',
    'pets.addNote': 'Adicionar anotação',
    'pets.selectPet': 'Selecionar pet',
    'pets.register': 'Registrar',
    
    // Modal de caminhada
    'pets.lastWalk': 'Última corrida:',
    'pets.kilometers': 'Quilômetros (ex: 2.5)',
    'pets.observationOptional': 'Observação (opcional)',
    'pets.walkRegistered': 'Caminhada de {km} km registrada.',
    'pets.walkRegisterError': 'Falha ao registrar.',
    'pets.noPetsWalk': 'Cadastre um pet antes de registrar uma caminhada.',
    
    // Modal de peso
    'pets.lastWeight': 'Último peso:',
    'pets.weightKg': 'Peso (kg)',
    'pets.weightRegistered': 'Peso {kg} kg registrado.',
    'pets.weightRegisterError': 'Falha ao registrar.',
    'pets.noPetsWeight': 'Cadastre um pet antes de registrar o peso.',
    
    // Modal de saúde
    'pets.healthType': 'Tipo',
    'pets.vaccine': 'Vacina',
    'pets.deworm': 'Vermífugo',
    'pets.bath': 'Banho',
    'pets.visit': 'Consulta',
    'pets.lastVaccine': 'Última vacina:',
    'pets.lastBath': 'Último banho',
    'pets.lastDeworm': 'Último vermífugo',
    'pets.lastVisit': 'Última consulta',
    'pets.healthRegistered': '{type} registrado.',
    'pets.healthRegisterError': 'Falha ao registrar.',
    'pets.noPetsHealth': 'Cadastre um pet antes de registrar saúde.',
    
    // Modal de anotação
    'pets.writeNote': 'Escreva sua anotação aqui...',
    'pets.emptyNote': 'Nota vazia',
    'pets.emptyNoteDesc': 'Escreva algo antes de salvar.',
    'pets.noteRegistered': 'Anotação salva.',
    'pets.noteRegisterError': 'Falha ao registrar.',
    'pets.noPetsNote': 'Cadastre um pet antes de adicionar uma anotação.',
    
    // Placeholders sem informação
    'pets.noInfo': '—',

    // ================== DASHBOARD ==================
    'dashboard.title': 'Saúde do Pet',
    'dashboard.selectPet': 'Selecionar pet',
    'dashboard.selectPetPlaceholder': 'Selecione um pet',
    
    // Seções
    'dashboard.summary': 'Resumo',
    'dashboard.weightEvolution': 'Evolução do Peso',
    'dashboard.physicalActivity': 'Atividade Física',
    'dashboard.lastNotes': 'Últimas Anotações',
    'dashboard.lastHealthEvents': 'Últimos Eventos de Saúde',
    'dashboard.automaticInsights': 'Insights Automáticos',
    
    // Cards de estatísticas
    'dashboard.currentWeight': 'Peso Atual',
    'dashboard.weeklyActivity': 'Atividade Semanal',
    'dashboard.healthStatus': 'Status de Saúde',
    'dashboard.totalRecords': 'Total de Registros',
    'dashboard.recordedActivities': 'Atividades registradas',
    
    // Status de peso
    'dashboard.stable': 'Estável',
    'dashboard.increased': 'aumentou',
    'dashboard.decreased': 'diminuiu',
    
    // Níveis de atividade
    'dashboard.veryActive': 'Muito ativo!',
    'dashboard.needsExercise': 'Precisa se exercitar',
    'dashboard.goodLevel': 'Nível bom',
    
    // Status de saúde
    'dashboard.excellent': 'Excelente',
    'dashboard.good': 'Bom',
    'dashboard.attention': 'Atenção',
    'dashboard.concerning': 'Preocupante',
    'dashboard.daysSinceCheckup': '{days} dias desde consulta',
    'dashboard.noCheckupRecorded': 'Sem consulta registrada',
    
    // Insights automáticos
    'dashboard.vetRecommended': 'Consulta veterinária recomendada em {days} dias',
    'dashboard.weightIncreased': 'Peso {trend} {change}kg recentemente',
    'dashboard.weightDecreased': 'Peso {trend} {change}kg recentemente',
    'dashboard.lowActivity': 'Atividade baixa esta semana. Que tal um passeio extra?',
    'dashboard.excellentActivity': 'Excelente! Seu pet está muito ativo esta semana!',
    
    // Gráficos - sem dados
    'dashboard.noWeightData': 'Sem registros de peso ainda',
    'dashboard.noWeightDataDesc': 'Registre o peso do seu pet para ver a evolução',
    'dashboard.noWalkData': 'Sem registros de caminhadas ainda',
    'dashboard.noWalkDataDesc': 'Registre as caminhadas para acompanhar a atividade',
    
    // Modal de observação
    'dashboard.observation': 'Observação:',
    'dashboard.viewNote': 'Ver observação',
    
    // Tipos de eventos de saúde (repetindo para consistência)
    'dashboard.vaccine': 'Vacina',
    'dashboard.deworm': 'Vermífugo', 
    'dashboard.bath': 'Banho',
    'dashboard.visit': 'Consulta',

    // ================== ADICIONAR COLEIRA ==================
    'collar.title': 'Adicionar Coleira',
    'collar.linkSmartCollar': 'Vincular coleira inteligente',
    'collar.howToLink': 'Como vincular:',
    'collar.step1': 'Localize o código na embalagem da coleira',
    'collar.step2': 'Digite o código no campo abaixo',
    'collar.step3': 'Ligue a coleira e aguarde a confirmação',
    'collar.collarCode': 'Código da Coleira',
    'collar.codePlaceholder': 'COL001234567890',
    'collar.codeHint': '💡 O código está impresso na embalagem e tem 15 caracteres (COL + 12 números)',
    'collar.exampleCode': 'Exemplo de código:',
    'collar.linkCollar': 'Vincular Coleira',
    'collar.linking': 'Vinculando...',
    'collar.helpText': 'Problemas para encontrar o código? Verifique a caixa da coleira ou o manual.',
    
    // Validações e mensagens
    'collar.enterCode': 'Digite o código da coleira',
    'collar.invalidCode': 'Código Inválido',
    'collar.invalidCodeDesc': 'O código deve ter o formato: COL seguido de 12 números\n\nExemplo: COL001234567890',
    'collar.petNotFound': 'Pet não identificado',
    'collar.collarAdded': 'Coleira Adicionada!',
    'collar.collarAddedDesc': 'A coleira {code} foi vinculada ao {petName}.\n\n⏳ Aguardando confirmação da coleira...\n(Pode levar alguns minutos)',
    'collar.linkError': 'Não foi possível vincular a coleira. Tente novamente.',

    // ================== BLOG ==================
    'blog.title': 'Blog da Comunidade',
    'blog.searchPlaceholder': 'Pesquisar posts...',
    'blog.newPost': 'Novo post',
    'blog.publish': 'Publicar',
    'blog.publishing': 'Publicando...',
    'blog.writePost': 'Escreva algo sobre seu pet...',
    
    // Estados do blog
    'blog.loginRequired': 'Login Necessário',
    'blog.loginRequiredDesc': 'Faça login com email na aba Tutor\npara acessar o blog da comunidade',
    'blog.noPosts': 'Nenhum post ainda',
    'blog.noPostsDesc': 'Seja o primeiro a compartilhar algo sobre seu pet!',
    
    // Validações
    'blog.emailLoginRequired': 'Você precisa fazer login com email para publicar no blog.',
    'blog.writeContent': 'Digite algo para publicar.',
    'blog.publishFailed': 'Não foi possível publicar',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.maps': 'Maps',
    'nav.pets': 'Pets',
    'nav.blog': 'Blog',
    'nav.tutor': 'Owner',
    'nav.settings': 'Settings',
    'nav.agenda': 'Schedule',
    'nav.about': 'About',

    // General
    'general.save': 'Save',
    'general.cancel': 'Cancel',
    'general.loading': 'Loading...',
    'general.error': 'Error',
    'general.success': 'Success',
    'general.edit': 'Edit',
    'general.confirm': 'Confirm',
    'general.delete': 'Delete',
    'general.add': 'Add',
    'general.filter': 'Filter',
    'general.apply': 'Apply',
    'general.clear': 'Clear',
    'general.close': 'Close',
    'general.years': 'years',

    // Tutor
    'tutor.name': 'Name',
    'tutor.phone': 'Phone',
    'tutor.address': 'Address',
    'tutor.email': 'Email',

    // Schedule
    'agenda.title': 'Schedule',
    'agenda.newReminder': 'New Reminder',
    'agenda.editReminder': 'Edit Reminder',
    'agenda.reminderTitle': 'Title',
    'agenda.reminderDescription': 'Description',
    'agenda.selectPet': 'Select Pet',
    'agenda.selectCategory': 'Select Category',
    'agenda.selectDate': 'Select Date',
    'agenda.selectTime': 'Select Time',
    'agenda.notification': 'Notification',
    'agenda.completed': 'Completed',
    'agenda.pending': 'Pending',
    'agenda.noReminders': 'No reminders for this date',
    'agenda.deleteConfirm': 'Are you sure you want to delete this reminder?',
    'agenda.reminderSaved': 'Reminder saved successfully!',
    'agenda.reminderDeleted': 'Reminder deleted!',
    'agenda.filters': 'Schedule Filters',
    'agenda.showCompleted': 'Show Completed',
    'agenda.notesOfDay': 'Notes of the day',
    'agenda.noNotes': 'No notes for this date',

    // Categories
    'category.consulta': 'Appointment',
    'category.medicacao': 'Medication',
    'category.banho': 'Bath',
    'category.exercicio': 'Exercise',
    'category.alimentacao': 'Feeding',
    'category.outro': 'Other',

    // Settings
    'settings.title': 'Settings',
    'settings.appearance': 'Appearance',
    'settings.theme': 'Theme',
    'settings.language': 'Language',
    'settings.accessibility': 'Accessibility',
    'settings.fontSize': 'Font Size',
    'settings.account': 'Account',
    'settings.support': 'Support',
    'settings.help': 'Help',
    'settings.about': 'About',
    
    // Themes
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.system': 'System',
    
    // Font sizes
    'fontSize.small': 'Small',
    'fontSize.medium': 'Medium',
    'fontSize.large': 'Large',

    // Auth
    'auth.logout': 'Logout',
    'auth.logoutConfirm': 'Are you sure you want to logout?',
    'auth.logoutError': 'Could not logout. Please try again.',

    // Buttons
    'button.ok': 'OK',
    'button.yes': 'Yes',
    'button.no': 'No',

    // Pet Status
    'pet.status.safe': 'SAFE',
    'pet.status.missing': 'MISSING',

    // ================== VALIDATIONS AND ERRORS ==================
    'validation.titleRequired': 'Title is required',
    'validation.petRequired': 'Select a pet',

    // ================== COMPONENTS ==================
    // PostCard
    'components.postCard.comment': 'Comment',
    'components.postCard.share': 'Share',
    'components.postCard.publishedToday': 'published today at',
    'components.postCard.comments': 'Comments',
    'components.postCard.noCommentsYet': 'No comments yet',
    'components.postCard.firstToComment': 'Be the first to comment!',
    'components.postCard.reply': 'Reply',
    'components.postCard.replyingTo': 'Replying to comment',
    'components.postCard.writeComment': 'Write a comment...',
    'components.postCard.writeReply': 'Write a reply...',
    'components.postCard.loginRequired': 'Login required',
    'components.postCard.loginToComment': 'Login to comment',
    'components.postCard.loginToReply': 'Login to reply',
    'components.postCard.writeCommentError': 'Write a comment',
    'components.postCard.writeReplyError': 'Write a reply',
    'components.postCard.commentSendError': 'Failed to send comment',
    'components.postCard.replySendError': 'Failed to send reply',
    'components.postCard.shareMessage': '🐾 Check out this BarkBuddy post:\n\n"{text}"\n\n📝 Shared by: {author}\n\nDownload BarkBuddy and join our pet owner community! 🎯',
    'components.postCard.shareTitle': 'BarkBuddy Post 🐾',
    'components.postCard.shareSuccess': 'Post shared successfully!',
    'components.postCard.shareError': 'Could not share this post',
    'components.postCard.commentCount': '{count} comment',
    'components.postCard.commentCountPlural': '{count} comments',

    // PetCard
    'components.petCard.foundYourPet': 'Found your pet!',
    'components.petCard.viewDetails': 'View details',

    // MapWeb
    'components.mapWeb.nativeMapUnavailable': 'Native map unavailable on Web. Open on Android/iOS.',

    // ListaNotas
    'components.notes.noNotesForDate': 'No notes for this date.',

    // ModalLembrete
    'components.modalLembrete.pet': 'Pet',

    // FiltrosAgenda
    'components.filters.title': 'Schedule Filters',
    'components.filters.pets': 'Pets',
    'components.filters.categories': 'Categories',
    'components.filters.clear': 'Clear',
    'components.filters.apply': 'Apply',

    // ================== MAPS/LOCATION ==================
    'maps.title': 'Location',
    'maps.selectPet': 'Select a pet',
    'maps.found': '✅ Found',
    'maps.lost': '🚨 Lost',
    'maps.markAsFound': '❌ Found',
    'maps.markAsLost': '🚨 Lost',
    'maps.newSafeZone': 'New Zone',
    'maps.tapOnMap': 'Tap on map',
    'maps.manage': 'Manage',
    'maps.zones': 'zones',
    'maps.zone': 'zone',
    'maps.createSafeZone': 'Create Safe Zone',
    'maps.createSafeZoneDesc': 'Tap on the map to define the center of the safe zone.',
    'maps.petSafe': '🏠 In safe zone',
    'maps.petOutside': '⚠️ Outside zones',
    'maps.petLost': '🚨 Pet lost',
    'maps.noLocation': 'No location yet',
    'maps.lastSeen': 'Last seen',
    'maps.inZone': '🏠 In',
    'maps.outsideZones': '📍 Outside zones',
    'maps.ago': 'ago',
    'maps.justNow': 'Just now',
    'maps.minutesAgo': 'min ago',
    'maps.hoursAgo': 'h ago',
    'maps.daysAgo': 'days ago',
    'maps.never': 'Never',
    'maps.refresh': 'Refresh',
    'maps.center': 'Center',
    'maps.centered': 'Centered',
    'maps.open': 'Open',
    'maps.realTime': 'Real time (1 min)',
    'maps.stopRealTime': 'Stop real time (1 min)',
    'maps.loadingMap': 'Loading map...',
    'maps.appleCredit': 'Maps provided by Apple',
    'maps.osmCredit': 'Map provided by OpenStreetMap',
    
    // Zone modals
    'maps.newSafeZoneTitle': 'New Safe Zone',
    'maps.zoneName': 'Zone name:',
    'maps.zoneNamePlaceholder': 'e.g., Home, Park, Vet',
    'maps.zoneRadius': 'Zone radius',
    'maps.zoneColor': 'Zone color:',
    'maps.createZone': 'Create Zone',
    'maps.safeZones': 'Safe Zones',
    'maps.noZonesCreated': 'No zones created',
    'maps.noZonesDesc': 'Create safe zones to automatically monitor when your pet enters or leaves important areas',
    'maps.radiusMeters': 'm radius',
    'maps.close': 'Close',
    
    // Alerts and confirmations
    'maps.markAsFoundTitle': 'Mark as found',
    'maps.markAsLostTitle': 'Mark as lost',
    'maps.markAsFoundConfirm': 'Do you want to mark {petName} as found?',
    'maps.markAsLostConfirm': 'Do you want to mark {petName} as lost?',
    'maps.statusUpdated': '{petName} marked as {status}.',
    'maps.statusUpdateError': 'Could not update status.',
    'maps.deleteZone': 'Delete zone',
    'maps.deleteZoneConfirm': 'Are you sure you want to delete the "{zoneName}" zone?\n\nThis action cannot be undone.',
    'maps.zoneDeleted': 'Zone deleted!',
    'maps.zoneDeleteError': 'Could not delete:',
    'maps.petEnteredZone': '🟢 Pet entered safe zone',
    'maps.petEnteredZoneDesc': '{petName} entered the "{zoneName}" zone',
    'maps.petLeftZone': '🔴 Pet left safe zone',
    'maps.petLeftZoneDesc': '{petName} left the "{zoneName}" zone',
    'maps.zoneCreatedSuccess': '✅ Success',
    'maps.zoneCreatedDesc': 'Zone "{zoneName}" created successfully!',
    'maps.zoneSaveError': '❌ Error',
    'maps.zoneSaveErrorDesc': 'Failed to save zone:',
    'maps.provideZoneName': 'Please provide a zone name.',
    
    // Error/loading states
    'maps.loginRequired': 'Login to see your pets',
    'maps.noUserFound': 'No authenticated user found.',
    'maps.noPetsTitle': 'No pets registered',
    'maps.noPetsDesc': 'Register a pet to start tracking location.',
    'maps.locationError': '❌ GPS Error',
    'maps.locationErrorDesc': 'Could not get location. Check if GPS is enabled.',
    'maps.permissionRequired': 'Permission required',
    'maps.permissionRequiredDesc': 'Allow location access to track your pet.',
    'maps.noLocationForPet': 'No location',
    'maps.noLocationForPetDesc': 'No location available for this pet.',
    
    // External map options
    'maps.openMap': 'Open map',
    'maps.chooseMapApp': 'Choose where to open the location:',
    'maps.googleMaps': 'Google Maps',
    'maps.openStreetMap': 'OpenStreetMap',
    'maps.waze': 'Waze',
    
    // Zone colors
    'maps.colorGreen': 'Green',
    'maps.colorBlue': 'Blue',
    'maps.colorRed': 'Red',
    'maps.colorYellow': 'Yellow',
    'maps.colorPurple': 'Purple',
    'maps.colorPink': 'Pink',

    // WebView - Popup messages
    'maps.petHere': 'Your pet is here!',
    'maps.zoneLabel': 'Zone:',

    // ================== PETS ==================
    'pets.title': 'My Pets',
    'pets.addPet': '+ Add a pet',
    'pets.addPetTitle': 'Add pet',
    'pets.editPetTitle': 'Edit pet',
    'pets.noPetsYet': 'No pets registered yet.',
    'pets.quickActions': 'Quick actions',
    
    // Pet form
    'pets.name': 'Name',
    'pets.nameRequired': 'Name *',
    'pets.species': 'Species (dog, cat...)',
    'pets.breed': 'Breed',
    'pets.age': 'Age (years)',
    'pets.photo': 'Photo',
    'pets.choosePhoto': 'Choose photo',
    'pets.changePhoto': 'Change photo',
    'pets.removePhoto': 'Remove photo',
    'pets.saveChanges': 'Save changes',
    
    // Pet information
    'pets.speciesLabel': 'Species:',
    'pets.breedLabel': 'Breed:',
    'pets.ageLabel': 'Age:',
    'pets.addCollar': '🔗 Add Collar',
    
    // Alerts and confirmations
    'pets.loginRequired': 'Login required',
    'pets.loginRequiredDesc': 'You need to be logged in to manage your pets.',
    'pets.nameRequiredAlert': 'Name required',
    'pets.nameRequiredAlertDesc': 'Please enter the pet\'s name.',
    'pets.photoUploadError': 'Photo upload error',
    'pets.photoUploadRetry': 'Please try again.',
    'pets.saveFailed': 'Failed to save pet',
    'pets.deletePet': 'Delete pet',
    'pets.deletePetConfirm': 'Are you sure you want to delete this pet?',
    'pets.removePhotoTitle': 'Remove photo',
    'pets.removePhotoConfirm': 'Do you want to remove the selected photo?',
    'pets.removePhotoAction': 'Remove',
    'pets.permissionRequired': 'Permission required',
    'pets.permissionRequiredDesc': 'Allow access to photos.',
    'pets.noPetsModal': 'No pets',
    
    // Dashboard
    'pets.dashboard': 'Dashboard',
    'pets.dashboardDesc': 'View your notes and pet graphs.',
    'pets.openDashboard': 'Open Dashboard',
    
    // Speed dial labels and actions
    'pets.walk': 'Walk',
    'pets.weight': 'Weight',
    'pets.health': 'Health',
    'pets.note': 'Note',
    
    // Record modals
    'pets.recordWalk': 'Record walk',
    'pets.recordWeight': 'Record weight',
    'pets.recordHealth': 'Record health event',
    'pets.addNote': 'Add note',
    'pets.selectPet': 'Select pet',
    'pets.register': 'Register',
    
    // Walk modal
    'pets.lastWalk': 'Last walk:',
    'pets.kilometers': 'Kilometers (e.g., 2.5)',
    'pets.observationOptional': 'Observation (optional)',
    'pets.walkRegistered': '{km} km walk recorded.',
    'pets.walkRegisterError': 'Failed to register.',
    'pets.noPetsWalk': 'Register a pet before recording a walk.',
    
    // Weight modal
    'pets.lastWeight': 'Last weight:',
    'pets.weightKg': 'Weight (kg)',
    'pets.weightRegistered': '{kg} kg weight recorded.',
    'pets.weightRegisterError': 'Failed to register.',
    'pets.noPetsWeight': 'Register a pet before recording weight.',
    
    // Health modal
    'pets.healthType': 'Type',
    'pets.vaccine': 'Vaccine',
    'pets.deworm': 'Deworming',
    'pets.bath': 'Bath',
    'pets.visit': 'Visit',
    'pets.lastVaccine': 'Last vaccine:',
    'pets.lastBath': 'Last bath',
    'pets.lastDeworm': 'Last deworming',
    'pets.lastVisit': 'Last visit',
    'pets.healthRegistered': '{type} registered.',
    'pets.healthRegisterError': 'Failed to register.',
    'pets.noPetsHealth': 'Register a pet before recording health.',
    
    // Note modal
    'pets.writeNote': 'Write your note here...',
    'pets.emptyNote': 'Empty note',
    'pets.emptyNoteDesc': 'Write something before saving.',
    'pets.noteRegistered': 'Note saved.',
    'pets.noteRegisterError': 'Failed to register.',
    'pets.noPetsNote': 'Register a pet before adding a note.',
    
    // Placeholders for missing info
    'pets.noInfo': '—',

    // ================== DASHBOARD ==================
    'dashboard.title': 'Pet Health',
    'dashboard.selectPet': 'Select pet',
    'dashboard.selectPetPlaceholder': 'Select a pet',
    
    // Sections
    'dashboard.summary': 'Summary',
    'dashboard.weightEvolution': 'Weight Evolution',
    'dashboard.physicalActivity': 'Physical Activity',
    'dashboard.lastNotes': 'Latest Notes',
    'dashboard.lastHealthEvents': 'Latest Health Events',
    'dashboard.automaticInsights': 'Automatic Insights',
    
    // Stats cards
    'dashboard.currentWeight': 'Current Weight',
    'dashboard.weeklyActivity': 'Weekly Activity',
    'dashboard.healthStatus': 'Health Status',
    'dashboard.totalRecords': 'Total Records',
    'dashboard.recordedActivities': 'Recorded activities',
    
    // Weight status
    'dashboard.stable': 'Stable',
    'dashboard.increased': 'increased',
    'dashboard.decreased': 'decreased',
    
    // Activity levels
    'dashboard.veryActive': 'Very active!',
    'dashboard.needsExercise': 'Needs exercise',
    'dashboard.goodLevel': 'Good level',
    
    // Health status
    'dashboard.excellent': 'Excellent',
    'dashboard.good': 'Good',
    'dashboard.attention': 'Attention',
    'dashboard.concerning': 'Concerning',
    'dashboard.daysSinceCheckup': '{days} days since checkup',
    'dashboard.noCheckupRecorded': 'No checkup recorded',
    
    // Automatic insights
    'dashboard.vetRecommended': 'Veterinary visit recommended in {days} days',
    'dashboard.weightIncreased': 'Weight {trend} {change}kg recently',
    'dashboard.weightDecreased': 'Weight {trend} {change}kg recently',
    'dashboard.lowActivity': 'Low activity this week. How about an extra walk?',
    'dashboard.excellentActivity': 'Excellent! Your pet is very active this week!',
    
    // Charts - no data
    'dashboard.noWeightData': 'No weight records yet',
    'dashboard.noWeightDataDesc': 'Record your pet\'s weight to see the evolution',
    'dashboard.noWalkData': 'No walk records yet',
    'dashboard.noWalkDataDesc': 'Record walks to track activity',
    
    // Observation modal
    'dashboard.observation': 'Observation:',
    'dashboard.viewNote': 'View note',
    
    // Health event types (repeating for consistency)
    'dashboard.vaccine': 'Vaccine',
    'dashboard.deworm': 'Deworming',
    'dashboard.bath': 'Bath',
    'dashboard.visit': 'Visit',

    // ================== ADD COLLAR ==================
    'collar.title': 'Add Collar',
    'collar.linkSmartCollar': 'Link smart collar',
    'collar.howToLink': 'How to link:',
    'collar.step1': 'Locate the code on the collar packaging',
    'collar.step2': 'Enter the code in the field below',
    'collar.step3': 'Turn on the collar and wait for confirmation',
    'collar.collarCode': 'Collar Code',
    'collar.codePlaceholder': 'COL001234567890',
    'collar.codeHint': '💡 The code is printed on the packaging and has 15 characters (COL + 12 numbers)',
    'collar.exampleCode': 'Example code:',
    'collar.linkCollar': 'Link Collar',
    'collar.linking': 'Linking...',
    'collar.helpText': 'Having trouble finding the code? Check the collar box or manual.',
    
    // Validations and messages
    'collar.enterCode': 'Enter the collar code',
    'collar.invalidCode': 'Invalid Code',
    'collar.invalidCodeDesc': 'The code must have the format: COL followed by 12 numbers\n\nExample: COL001234567890',
    'collar.petNotFound': 'Pet not identified',
    'collar.collarAdded': 'Collar Added!',
    'collar.collarAddedDesc': 'The collar {code} has been linked to {petName}.\n\n⏳ Waiting for collar confirmation...\n(This may take a few minutes)',
    'collar.linkError': 'Could not link the collar. Please try again.',

    // ================== BLOG ==================
    'blog.title': 'Community Blog',
    'blog.searchPlaceholder': 'Search posts...',
    'blog.newPost': 'New post',
    'blog.publish': 'Publish',
    'blog.publishing': 'Publishing...',
    'blog.writePost': 'Write something about your pet...',
    
    // Blog states
    'blog.loginRequired': 'Login Required',
    'blog.loginRequiredDesc': 'Log in with email in the Owner tab\nto access the community blog',
    'blog.noPosts': 'No posts yet',
    'blog.noPostsDesc': 'Be the first to share something about your pet!',
    
    // Validations
    'blog.emailLoginRequired': 'You need to log in with email to publish to the blog.',
    'blog.writeContent': 'Write something to publish.',
    'blog.publishFailed': 'Could not publish',
  },
  es: {
    // Navegación
    'nav.dashboard': 'Panel',
    'nav.maps': 'Mapas',
    'nav.pets': 'Mascotas',
    'nav.blog': 'Blog',
    'nav.tutor': 'Dueño',
    'nav.settings': 'Configuración',
    'nav.agenda': 'Agenda',
    'nav.about': 'Acerca de',

    // General
    'general.save': 'Guardar',
    'general.cancel': 'Cancelar',
    'general.loading': 'Cargando...',
    'general.error': 'Error',
    'general.success': 'Éxito',
    'general.edit': 'Editar',
    'general.confirm': 'Confirmar',
    'general.delete': 'Eliminar',
    'general.add': 'Añadir',
    'general.filter': 'Filtro',
    'general.apply': 'Aplicar',
    'general.clear': 'Limpiar',
    'general.close': 'Cerrar',
    'general.years': 'años',

    // Tutor
    'tutor.name': 'Nombre',
    'tutor.phone': 'Teléfono',
    'tutor.address': 'Dirección', 
    'tutor.email': 'Email',

    // Agenda
    'agenda.title': 'Agenda',
    'agenda.newReminder': 'Nuevo Recordatorio',
    'agenda.editReminder': 'Editar Recordatorio',
    'agenda.reminderTitle': 'Título',
    'agenda.reminderDescription': 'Descripción',
    'agenda.selectPet': 'Seleccionar Mascota',
    'agenda.selectCategory': 'Seleccionar Categoría',
    'agenda.selectDate': 'Seleccionar Fecha',
    'agenda.selectTime': 'Seleccionar Hora',
    'agenda.notification': 'Notificación',
    'agenda.completed': 'Completado',
    'agenda.pending': 'Pendiente',
    'agenda.noReminders': 'No hay recordatorios para esta fecha',
    'agenda.deleteConfirm': '¿Estás seguro de que deseas eliminar este recordatorio?',
    'agenda.reminderSaved': '¡Recordatorio guardado exitosamente!',
    'agenda.reminderDeleted': '¡Recordatorio eliminado!',
    'agenda.filters': 'Filtros de Agenda',
    'agenda.showCompleted': 'Mostrar Completados',
    'agenda.notesOfDay': 'Notas del día',
    'agenda.noNotes': 'No hay notas para esta fecha',

    // Categorías
    'category.consulta': 'Consulta',
    'category.medicacao': 'Medicación',
    'category.banho': 'Baño',
    'category.exercicio': 'Ejercicio',
    'category.alimentacao': 'Alimentación',
    'category.outro': 'Otro',

    // Configuración
    'settings.title': 'Configuración',
    'settings.appearance': 'Apariencia',
    'settings.theme': 'Tema',
    'settings.language': 'Idioma',
    'settings.accessibility': 'Accesibilidad',
    'settings.fontSize': 'Tamaño de Fuente',
    'settings.account': 'Cuenta',
    'settings.support': 'Soporte',
    'settings.help': 'Ayuda',
    'settings.about': 'Acerca de',
    
    // Temas
    'theme.light': 'Claro',
    'theme.dark': 'Oscuro',
    'theme.system': 'Sistema',
    
    // Tamaños de fuente
    'fontSize.small': 'Pequeño',
    'fontSize.medium': 'Mediano',
    'fontSize.large': 'Grande',

    // Autenticación
    'auth.logout': 'Cerrar Sesión',
    'auth.logoutConfirm': '¿Estás seguro de que deseas cerrar sesión?',
    'auth.logoutError': 'No se pudo cerrar sesión. Inténtalo de nuevo.',

    // Botones
    'button.ok': 'OK',
    'button.yes': 'Sí',
    'button.no': 'No',

    // Estado de Mascotas
    'pet.status.safe': 'SEGURA',
    'pet.status.missing': 'DESAPARECIDA',

    // ================== VALIDACIONES Y ERRORES ==================
    'validation.titleRequired': 'Título es obligatorio',
    'validation.petRequired': 'Selecciona una mascota',

    // ================== COMPONENTS ==================
    // PostCard
    'components.postCard.comment': 'Comentar',
    'components.postCard.share': 'Compartir',
    'components.postCard.publishedToday': 'publicado hoy a las',
    'components.postCard.comments': 'Comentarios',
    'components.postCard.noCommentsYet': 'No hay comentarios aún',
    'components.postCard.firstToComment': '¡Sé el primero en comentar!',
    'components.postCard.reply': 'Responder',
    'components.postCard.replyingTo': 'Respondiendo comentario',
    'components.postCard.writeComment': 'Escribe un comentario...',
    'components.postCard.writeReply': 'Escribe una respuesta...',
    'components.postCard.loginRequired': 'Login necesario',
    'components.postCard.loginToComment': 'Inicia sesión para comentar',
    'components.postCard.loginToReply': 'Inicia sesión para responder',
    'components.postCard.writeCommentError': 'Escribe un comentario',
    'components.postCard.writeReplyError': 'Escribe una respuesta',
    'components.postCard.commentSendError': 'Error al enviar comentario',
    'components.postCard.replySendError': 'Error al enviar respuesta',
    'components.postCard.shareMessage': '🐾 Mira esta publicación de BarkBuddy:\n\n"{text}"\n\n📝 Compartido por: {author}\n\n¡Descarga BarkBuddy y únete a nuestra comunidad de dueños de mascotas! 🎯',
    'components.postCard.shareTitle': 'Publicación de BarkBuddy 🐾',
    'components.postCard.shareSuccess': '¡Publicación compartida exitosamente!',
    'components.postCard.shareError': 'No fue posible compartir esta publicación',
    'components.postCard.commentCount': '{count} comentario',
    'components.postCard.commentCountPlural': '{count} comentarios',

    // PetCard
    'components.petCard.foundYourPet': '¡Encontré tu mascota!',
    'components.petCard.viewDetails': 'Ver detalles',

    // MapWeb
    'components.mapWeb.nativeMapUnavailable': 'Mapa nativo no disponible en Web. Abrir en Android/iOS.',

    // ListaNotas
    'components.notes.noNotesForDate': 'No hay notas para esta fecha.',

    // ModalLembrete
    'components.modalLembrete.pet': 'Mascota',

    // FiltrosAgenda
    'components.filters.title': 'Filtros de Agenda',
    'components.filters.pets': 'Mascotas',
    'components.filters.categories': 'Categorías',
    'components.filters.clear': 'Limpiar',
    'components.filters.apply': 'Aplicar',

    // ================== MAPAS/UBICACIÓN ==================
    'maps.title': 'Ubicación',
    'maps.selectPet': 'Seleccionar mascota',
    'maps.found': '✅ Encontrada',
    'maps.lost': '🚨 Perdida',
    'maps.markAsFound': '❌ Encontrada',
    'maps.markAsLost': '🚨 Perdida',
    'maps.newSafeZone': 'Nueva Zona',
    'maps.tapOnMap': 'Tocar en mapa',
    'maps.manage': 'Gestionar',
    'maps.zones': 'zonas',
    'maps.zone': 'zona',
    'maps.createSafeZone': 'Crear Zona Segura',
    'maps.createSafeZoneDesc': 'Toca en el mapa para definir el centro de la zona segura.',
    'maps.petSafe': '🏠 En zona segura',
    'maps.petOutside': '⚠️ Fuera de zonas',
    'maps.petLost': '🚨 Mascota perdida',
    'maps.noLocation': 'Sin ubicación aún',
    'maps.lastSeen': 'Visto por última vez',
    'maps.inZone': '🏠 En',
    'maps.outsideZones': '📍 Fuera de zonas',
    'maps.ago': 'hace',
    'maps.justNow': 'Ahora mismo',
    'maps.minutesAgo': 'min atrás',
    'maps.hoursAgo': 'h atrás',
    'maps.daysAgo': 'días atrás',
    'maps.never': 'Nunca',
    'maps.refresh': 'Actualizar',
    'maps.center': 'Centrar',
    'maps.centered': 'Centrado',
    'maps.open': 'Abrir',
    'maps.realTime': 'Tiempo real (1 min)',
    'maps.stopRealTime': 'Parar tiempo real (1 min)',
    'maps.loadingMap': 'Cargando mapa...',
    'maps.appleCredit': 'Mapas proporcionados por Apple',
    'maps.osmCredit': 'Mapa proporcionado por OpenStreetMap',
    
    // Modales de zona
    'maps.newSafeZoneTitle': 'Nueva Zona Segura',
    'maps.zoneName': 'Nombre de la zona:',
    'maps.zoneNamePlaceholder': 'ej: Casa, Parque, Veterinario',
    'maps.zoneRadius': 'Radio de la zona',
    'maps.zoneColor': 'Color de la zona:',
    'maps.createZone': 'Crear Zona',
    'maps.safeZones': 'Zonas Seguras',
    'maps.noZonesCreated': 'No hay zonas creadas',
    'maps.noZonesDesc': 'Crea zonas seguras para monitorear automáticamente cuando tu mascota entra o sale de áreas importantes',
    'maps.radiusMeters': 'm de radio',
    'maps.close': 'Cerrar',
    
    // Alertas y confirmaciones
    'maps.markAsFoundTitle': 'Marcar como encontrada',
    'maps.markAsLostTitle': 'Marcar como perdida',
    'maps.markAsFoundConfirm': '¿Deseas marcar a {petName} como encontrada?',
    'maps.markAsLostConfirm': '¿Deseas marcar a {petName} como perdida?',
    'maps.statusUpdated': '{petName} marcada como {status}.',
    'maps.statusUpdateError': 'No se pudo actualizar el estado.',
    'maps.deleteZone': 'Eliminar zona',
    'maps.deleteZoneConfirm': '¿Estás seguro de que deseas eliminar la zona "{zoneName}"?\n\nEsta acción no se puede deshacer.',
    'maps.zoneDeleted': '¡Zona eliminada!',
    'maps.zoneDeleteError': 'No se pudo eliminar:',
    'maps.petEnteredZone': '🟢 Mascota entró en zona segura',
    'maps.petEnteredZoneDesc': '{petName} entró en la zona "{zoneName}"',
    'maps.petLeftZone': '🔴 Mascota salió de zona segura',
    'maps.petLeftZoneDesc': '{petName} salió de la zona "{zoneName}"',
    'maps.zoneCreatedSuccess': '✅ Éxito',
    'maps.zoneCreatedDesc': 'Zona "{zoneName}" creada exitosamente!',
    'maps.zoneSaveError': '❌ Error',
    'maps.zoneSaveErrorDesc': 'Error al guardar zona:',
    'maps.provideZoneName': 'Proporciona un nombre para la zona.',
    
    // Estados de error/carga
    'maps.loginRequired': 'Inicia sesión para ver tus mascotas',
    'maps.noUserFound': 'No se encontró un usuario autenticado.',
    'maps.noPetsTitle': 'No hay mascotas registradas',
    'maps.noPetsDesc': 'Registra una mascota para comenzar a rastrear la ubicación.',
    'maps.locationError': '❌ Error GPS',
    'maps.locationErrorDesc': 'No se pudo obtener la ubicación. Verifica que el GPS esté activado.',
    'maps.permissionRequired': 'Permiso requerido',
    'maps.permissionRequiredDesc': 'Permite el acceso a la ubicación para rastrear tu mascota.',
    'maps.noLocationForPet': 'Sin ubicación',
    'maps.noLocationForPetDesc': 'No hay ubicación disponible para esta mascota.',
    
    // Opciones de mapas externos
    'maps.openMap': 'Abrir mapa',
    'maps.chooseMapApp': 'Elige dónde abrir la ubicación:',
    'maps.googleMaps': 'Google Maps',
    'maps.openStreetMap': 'OpenStreetMap',
    'maps.waze': 'Waze',
    
    // Colores de zona
    'maps.colorGreen': 'Verde',
    'maps.colorBlue': 'Azul',
    'maps.colorRed': 'Rojo',
    'maps.colorYellow': 'Amarillo',
    'maps.colorPurple': 'Púrpura',
    'maps.colorPink': 'Rosa',

    // WebView - Mensajes de popup
    'maps.petHere': '¡Tu mascota está aquí!',
    'maps.zoneLabel': 'Zona:',

    // ================== MASCOTAS ==================
    'pets.title': 'Mis Mascotas',
    'pets.addPet': '+ Añadir una mascota',
    'pets.addPetTitle': 'Añadir mascota',
    'pets.editPetTitle': 'Editar mascota',
    'pets.noPetsYet': 'No hay mascotas registradas aún.',
    'pets.quickActions': 'Acciones rápidas',
    
    // Formulario de mascota
    'pets.name': 'Nombre',
    'pets.nameRequired': 'Nombre *',
    'pets.species': 'Especie (perro, gato...)',
    'pets.breed': 'Raza',
    'pets.age': 'Edad (años)',
    'pets.photo': 'Foto',
    'pets.choosePhoto': 'Elegir foto',
    'pets.changePhoto': 'Cambiar foto',
    'pets.removePhoto': 'Quitar foto',
    'pets.saveChanges': 'Guardar cambios',
    
    // Información de mascota
    'pets.speciesLabel': 'Especie:',
    'pets.breedLabel': 'Raza:',
    'pets.ageLabel': 'Edad:',
    'pets.addCollar': '🔗 Añadir Collar',
    
    // Alertas y confirmaciones
    'pets.loginRequired': 'Inicio de sesión requerido',
    'pets.loginRequiredDesc': 'Necesitas iniciar sesión para gestionar tus mascotas.',
    'pets.nameRequiredAlert': 'Nombre requerido',
    'pets.nameRequiredAlertDesc': 'Por favor ingresa el nombre de la mascota.',
    'pets.photoUploadError': 'Error al subir foto',
    'pets.photoUploadRetry': 'Por favor inténtalo de nuevo.',
    'pets.saveFailed': 'Error al guardar mascota',
    'pets.deletePet': 'Eliminar mascota',
    'pets.deletePetConfirm': '¿Estás seguro de que deseas eliminar esta mascota?',
    'pets.removePhotoTitle': 'Quitar foto',
    'pets.removePhotoConfirm': '¿Deseas quitar la foto seleccionada?',
    'pets.removePhotoAction': 'Quitar',
    'pets.permissionRequired': 'Permiso requerido',
    'pets.permissionRequiredDesc': 'Permite el acceso a las fotos.',
    'pets.noPetsModal': 'No hay mascotas',
    
    // Dashboard
    'pets.dashboard': 'Panel',
    'pets.dashboardDesc': 'Ve tus notas y gráficos de mascota.',
    'pets.openDashboard': 'Abrir Panel',
    
    // Etiquetas de speed dial y acciones
    'pets.walk': 'Paseo',
    'pets.weight': 'Peso',
    'pets.health': 'Salud',
    'pets.note': 'Nota',
    
    // Modales de registro
    'pets.recordWalk': 'Registrar paseo',
    'pets.recordWeight': 'Registrar peso',
    'pets.recordHealth': 'Registrar evento de salud',
    'pets.addNote': 'Añadir nota',
    'pets.selectPet': 'Seleccionar mascota',
    'pets.register': 'Registrar',
    
    // Modal de paseo
    'pets.lastWalk': 'Último paseo:',
    'pets.kilometers': 'Kilómetros (ej: 2.5)',
    'pets.observationOptional': 'Observación (opcional)',
    'pets.walkRegistered': 'Paseo de {km} km registrado.',
    'pets.walkRegisterError': 'Error al registrar.',
    'pets.noPetsWalk': 'Registra una mascota antes de registrar un paseo.',
    
    // Modal de peso
    'pets.lastWeight': 'Último peso:',
    'pets.weightKg': 'Peso (kg)',
    'pets.weightRegistered': 'Peso de {kg} kg registrado.',
    'pets.weightRegisterError': 'Error al registrar.',
    'pets.noPetsWeight': 'Registra una mascota antes de registrar el peso.',
    
    // Modal de salud
    'pets.healthType': 'Tipo',
    'pets.vaccine': 'Vacuna',
    'pets.deworm': 'Desparasitación',
    'pets.bath': 'Baño',
    'pets.visit': 'Visita',
    'pets.lastVaccine': 'Última vacuna:',
    'pets.lastBath': 'Último baño',
    'pets.lastDeworm': 'Última desparasitación',
    'pets.lastVisit': 'Última visita',
    'pets.healthRegistered': '{type} registrado.',
    'pets.healthRegisterError': 'Error al registrar.',
    'pets.noPetsHealth': 'Registra una mascota antes de registrar salud.',
    
    // Modal de nota
    'pets.writeNote': 'Escribe tu nota aquí...',
    'pets.emptyNote': 'Nota vacía',
    'pets.emptyNoteDesc': 'Escribe algo antes de guardar.',
    'pets.noteRegistered': 'Nota guardada.',
    'pets.noteRegisterError': 'Error al registrar.',
    'pets.noPetsNote': 'Registra una mascota antes de añadir una nota.',
    
    // Marcadores de posición para información faltante
    'pets.noInfo': '—',

    // ================== DASHBOARD ==================
    'dashboard.title': 'Salud de Mascota',
    'dashboard.selectPet': 'Seleccionar mascota',
    'dashboard.selectPetPlaceholder': 'Selecciona una mascota',
    
    // Secciones
    'dashboard.summary': 'Resumen',
    'dashboard.weightEvolution': 'Evolución del Peso',
    'dashboard.physicalActivity': 'Actividad Física',
    'dashboard.lastNotes': 'Últimas Notas',
    'dashboard.lastHealthEvents': 'Últimos Eventos de Salud',
    'dashboard.automaticInsights': 'Insights Automáticos',
    
    // Cards de estadísticas
    'dashboard.currentWeight': 'Peso Actual',
    'dashboard.weeklyActivity': 'Actividad Semanal',
    'dashboard.healthStatus': 'Estado de Salud',
    'dashboard.totalRecords': 'Total de Registros',
    'dashboard.recordedActivities': 'Actividades registradas',
    
    // Estados de peso
    'dashboard.stable': 'Estable',
    'dashboard.increased': 'aumentó',
    'dashboard.decreased': 'disminuyó',
    
    // Niveles de actividad
    'dashboard.veryActive': '¡Muy activa!',
    'dashboard.needsExercise': 'Necesita ejercicio',
    'dashboard.goodLevel': 'Buen nivel',
    
    // Estados de salud
    'dashboard.excellent': 'Excelente',
    'dashboard.good': 'Bueno',
    'dashboard.attention': 'Atención',
    'dashboard.concerning': 'Preocupante',
    'dashboard.daysSinceCheckup': '{days} días desde consulta',
    'dashboard.noCheckupRecorded': 'Sin consulta registrada',
    
    // Insights automáticos
    'dashboard.vetRecommended': 'Visita veterinaria recomendada en {days} días',
    'dashboard.weightIncreased': 'Peso {trend} {change}kg recientemente',
    'dashboard.weightDecreased': 'Peso {trend} {change}kg recientemente',
    'dashboard.lowActivity': 'Actividad baja esta semana. ¿Qué tal un paseo extra?',
    'dashboard.excellentActivity': '¡Excelente! Tu mascota está muy activa esta semana!',
    
    // Gráficos - sin datos
    'dashboard.noWeightData': 'Sin registros de peso aún',
    'dashboard.noWeightDataDesc': 'Registra el peso de tu mascota para ver la evolución',
    'dashboard.noWalkData': 'Sin registros de paseos aún',
    'dashboard.noWalkDataDesc': 'Registra los paseos para seguir la actividad',
    
    // Modal de observación
    'dashboard.observation': 'Observación:',
    'dashboard.viewNote': 'Ver nota',
    
    // Tipos de eventos de salud (repitiendo para consistencia)
    'dashboard.vaccine': 'Vacuna',
    'dashboard.deworm': 'Desparasitación',
    'dashboard.bath': 'Baño',
    'dashboard.visit': 'Visita',

    // ================== AÑADIR COLLAR ==================
    'collar.title': 'Añadir Collar',
    'collar.linkSmartCollar': 'Vincular collar inteligente',
    'collar.howToLink': 'Cómo vincular:',
    'collar.step1': 'Localiza el código en el empaque del collar',
    'collar.step2': 'Ingresa el código en el campo siguiente',
    'collar.step3': 'Enciende el collar y espera la confirmación',
    'collar.collarCode': 'Código del Collar',
    'collar.codePlaceholder': 'COL001234567890',
    'collar.codeHint': '💡 El código está impreso en el empaque y tiene 15 caracteres (COL + 12 números)',
    'collar.exampleCode': 'Ejemplo de código:',
    'collar.linkCollar': 'Vincular Collar',
    'collar.linking': 'Vinculando...',
    'collar.helpText': '¿Problemas para encontrar el código? Revisa la caja del collar o el manual.',
    
    // Validaciones y mensajes
    'collar.enterCode': 'Ingresa el código del collar',
    'collar.invalidCode': 'Código Inválido',
    'collar.invalidCodeDesc': 'El código debe tener el formato: COL seguido de 12 números\n\nEjemplo: COL001234567890',
    'collar.petNotFound': 'Mascota no identificada',
    'collar.collarAdded': '¡Collar Añadido!',
    'collar.collarAddedDesc': 'El collar {code} ha sido vinculado a {petName}.\n\n⏳ Esperando confirmación del collar...\n(Puede tomar algunos minutos)',
    'collar.linkError': 'No se pudo vincular el collar. Inténtalo de nuevo.',

    // ================== BLOG ==================
    'blog.title': 'Blog de la Comunidad',
    'blog.searchPlaceholder': 'Buscar publicaciones...',
    'blog.newPost': 'Nueva publicación',
    'blog.publish': 'Publicar',
    'blog.publishing': 'Publicando...',
    'blog.writePost': 'Escribe algo sobre tu mascota...',
    
    // Estados del blog
    'blog.loginRequired': 'Inicio de Sesión Requerido',
    'blog.loginRequiredDesc': 'Inicia sesión con email en la pestaña Dueño\npara acceder al blog de la comunidad',
    'blog.noPosts': 'No hay publicaciones aún',
    'blog.noPostsDesc': '¡Sé el primero en compartir algo sobre tu mascota!',
    
    // Validaciones
    'blog.emailLoginRequired': 'Necesitas iniciar sesión con email para publicar en el blog.',
    'blog.writeContent': 'Escribe algo para publicar.',
    'blog.publishFailed': 'No se pudo publicar',
  },
};

type TranslationKey = keyof typeof translations.pt;
type Language = 'pt' | 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

// Função para detectar idioma do dispositivo sem expo-localization
const getDeviceLanguage = (): Language => {
  try {
    let deviceLanguage = 'pt';
    
    if (Platform.OS === 'ios') {
      deviceLanguage = NativeModules.SettingsManager?.settings?.AppleLocale ||
                      NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
                      'pt';
    } else if (Platform.OS === 'android') {
      deviceLanguage = NativeModules.I18nManager?.localeIdentifier || 'pt';
    }
    
    // Extrair apenas o código do idioma (pt-BR -> pt)
    const languageCode = deviceLanguage.split('-')[0].split('_')[0].toLowerCase();
    
    // Verificar se é um idioma suportado
    if (['pt', 'en', 'es'].includes(languageCode)) {
      return languageCode as Language;
    }
    
    return 'pt'; // Fallback para português
  } catch (error) {
    console.log('Erro ao detectar idioma do dispositivo:', error);
    return 'pt';
  }
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('pt');

  const loadLanguage = useCallback(async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage && ['pt', 'en', 'es'].includes(savedLanguage)) {
        setLanguageState(savedLanguage as Language);
      } else {
        // Detectar idioma do sistema
        const deviceLanguage = getDeviceLanguage();
        setLanguageState(deviceLanguage);
        await AsyncStorage.setItem('language', deviceLanguage);
      }
    } catch (error) {
      console.error('Erro ao carregar idioma:', error);
      setLanguageState('pt');
    }
  }, []);

  useEffect(() => {
    loadLanguage();
  }, [loadLanguage]);

  const setLanguage = useCallback(async (lang: Language) => {
    try {
      await AsyncStorage.setItem('language', lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Erro ao salvar idioma:', error);
    }
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    const languageTranslations = translations[language] || translations.pt;
    return languageTranslations[key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage deve ser usado dentro de um LanguageProvider');
  }
  return context;
};