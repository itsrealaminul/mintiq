// ══════════════════════════════════════════════
// MINTIQ Push Notification System
// ══════════════════════════════════════════════

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

export function sendLocalNotification(title: string, body: string, icon?: string) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: icon || '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'mintiq-notification',
    })
  }
}

export function scheduleDailyReminder() {
  // Check if user has already been reminded today
  const lastReminder = localStorage.getItem('mintiq-last-reminder')
  const today = new Date().toISOString().split('T')[0]

  if (lastReminder === today) return

  // Schedule reminder for 9 AM
  const now = new Date()
  const reminderTime = new Date()
  reminderTime.setHours(9, 0, 0, 0)

  if (now > reminderTime) {
    // If it's past 9 AM, remind in 1 minute
    setTimeout(() => {
      sendLocalNotification(
        'MINTIQ - আজকের বোনাস! 🎁',
        'আজকের দৈনিক বোনাস নিন এবং পয়েন্ট আয় করুন!'
      )
      localStorage.setItem('mintiq-last-reminder', today)
    }, 60000)
  } else {
    // Schedule for 9 AM
    const delay = reminderTime.getTime() - now.getTime()
    setTimeout(() => {
      sendLocalNotification(
        'MINTIQ - আজকের বোনাস! 🎁',
        'আজকের দৈনিক বোনাস নিন এবং পয়েন্ট আয় করুন!'
      )
      localStorage.setItem('mintiq-last-reminder', today)
    }, delay)
  }
}

export function sendTaskCompleteNotification(points: number) {
  sendLocalNotification(
    'MINTIQ - টাস্ক সম্পন্ন! ✅',
    `আপনি ${points} পয়েন্ট পেয়েছেন!`
  )
}

export function sendWithdrawalNotification(amount: number) {
  sendLocalNotification(
    'MINTIQ - উত্তোলন সফল! 💰',
    `৳${amount} আপনার অ্যাকাউন্টে পাঠানো হয়েছে!`
  )
}

export function sendReferralNotification(bonus: number) {
  sendLocalNotification(
    'MINTIQ - রেফারেল বোনাস! 👥',
    `আপনি ${bonus} পয়েন্ট বোনাস পেয়েছেন!`
  )
}
