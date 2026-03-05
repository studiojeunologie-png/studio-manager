import { clsx } from 'clsx'

export function cn(...inputs) {
  return clsx(inputs)
}

/**
 * Formater un montant en euros
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

/**
 * Formater une date en français
 */
export function formatDate(date, options = {}) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  }).format(new Date(date))
}

/**
 * Formater date et heure
 */
export function formatDateTime(date) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

/**
 * Couleurs par type de session
 */
export const sessionTypeColors = {
  enregistrement: { bg: 'bg-brand-50', text: 'text-brand-600', dot: 'bg-brand-500' },
  mixage: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
  mastering: { bg: 'bg-purple-50', text: 'text-purple-600', dot: 'bg-purple-500' },
  composition: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  autre: { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-500' },
}

/**
 * Labels français
 */
export const sessionTypeLabels = {
  enregistrement: 'Enregistrement',
  mixage: 'Mixage',
  mastering: 'Mastering',
  composition: 'Composition',
  autre: 'Autre',
}

export const sessionStatusLabels = {
  planifiee: 'Planifiée',
  confirmee: 'Confirmée',
  en_cours: 'En cours',
  terminee: 'Terminée',
  annulee: 'Annulée',
}

export const transactionTypeLabels = {
  revenu: 'Revenu',
  depense: 'Dépense',
}

export const paymentStatusLabels = {
  en_attente: 'En attente',
  paye: 'Payé',
  annule: 'Annulé',
}
