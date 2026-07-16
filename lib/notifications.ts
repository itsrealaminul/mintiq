// ══════════════════════════════════════════════
// MINTIQ Push Notification System
// ══════════════════════════════════════════════

const MOTIVATIONAL_MESSAGES = [
  'আজকে কত পয়েন্ট আয় করবেন? শুরু করুন! 💪',
  'প্রতিদিন ছোট ছোট কাজ = বড় আয়! 🚀',
  'আপনার বন্ধুকে রেফার করুন — ১০০ পয়েন্ট বোনাস! 👥',
  'আজকে একটা ভিডিও দেখুন — সহজ আয়! 📺',
  'গেম খেলে পয়েন্ট পান — মজার সাথে আয়! 🎮',
  'সার্ভে সম্পন্ন করুন — বেশি পয়েন্ট পান! 📝',
  'লগাতার আসুন — স্ট্রিক বোনাস পান! 🔥',
  'আপনার পয়েন্ট টাকায় রূপান্তর করুন! 💰',
]

const DAILY_TASKS = [
  { task: 'বিজ্ঞাপন দেখুন', points: '+1-3', icon: '📺' },
  { task: 'ভিডিও দেখুন', points: '+5-15', icon: '🎬' },
  { task: 'সার্ভে সম্পন্ন করুন', points: '+15-40', icon: '📝' },
  { task: 'গেম খেলুন', points: '+3-8', icon: '🎮' },
  { task: 'টাস্ক করুন', points: '+2-5', icon: '📋' },
  { task: 'বন্ধুকে রেফার করুন', points: '+100', icon: '👥' },
]

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

export function sendLocalNotification(title: string, body: string, icon?: string, tag?: string) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: icon || '/favicon.svg',
      badge: '/favicon.svg',
      tag: tag || 'mintiq-notification',
      vibrate: [200, 100, 200],
    })
  }
}

export function getRandomMotivation(): string {
  return MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]
}

export function getRandomDailyTask(): typeof DAILY_TASKS[0] {
  return DAILY_TASKS[Math.floor(Math.random() * DAILY_TASKS.length)]
}

export function scheduleDailyReminder() {
  const lastReminder = localStorage.getItem('mintiq-last-reminder')
  const today = new Date().toISOString().split('T')[0]

  if (lastReminder === today) return

  const now = new Date()
  const reminderTime = new Date()
  reminderTime.setHours(9, 0, 0, 0)

  const sendReminder = () => {
    const motivation = getRandomMotivation()
    const dailyTask = getRandomDailyTask()
    
    sendLocalNotification(
      'MINTIQ - আজকের টাস্ক! ${dailyTask.icon}',
      `${dailyTask.task} করে ${dailyTask.points} পয়েন্ট পান! ${motivation}`,
      '/favicon.svg',
      'daily-reminder'
    )
    
    localStorage.setItem('mintiq-last-reminder', today)
  }

  if (now > reminderTime) {
    setTimeout(sendReminder, 60000)
  } else {
    const delay = reminderTime.getTime() - now.getTime()
    setTimeout(sendReminder, delay)
  }
}

export function scheduleNewTaskNotification() {
  // Check every 30 minutes for new tasks
  setInterval(() => {
    const lastCheck = localStorage.getItem('mintiq-last-task-check')
    const now = Date.now()
    
    if (lastCheck && now - parseInt(lastCheck) < 30 * 60 * 1000) return
    
    localStorage.setItem('mintiq-last-task-check', now.toString())
    
    const motivation = getRandomMotivation()
    sendLocalNotification(
      'MINTIQ - নতুন টাস্ক! 🆕',
      `নতুন টাস্ক পাওয়া গেছে! এখনই করুন। ${motivation}`,
      '/favicon.svg',
      'new-task'
    )
  }, 30 * 60 * 1000) // 30 minutes
}

export function sendTaskCompleteNotification(points: number) {
  const motivations = [
    'চালিয়ে যান! 💪',
    'দারুণ! আরো করুন! 🚀',
    'আপনি সেরা! ⭐',
    'পয়েন্ট বাড়ছে! 📈',
  ]
  const motivation = motivations[Math.floor(Math.random() * motivations.length)]
  
  sendLocalNotification(
    'MINTIQ - টাস্ক সম্পন্ন! ✅',
    `আপনি ${points} পয়েন্ট পেয়েছেন! ${motivation}`,
    '/favicon.svg',
    'task-complete'
  )
}

export function sendWithdrawalNotification(amount: number) {
  sendLocalNotification(
    'MINTIQ - উত্তোলন সফল! 💰',
    `৳${amount} আপনার অ্যাকাউন্টে পাঠানো হয়েছে! অভিনন্দন! 🎉`,
    '/favicon.svg',
    'withdrawal'
  )
}

export function sendReferralNotification(bonus: number) {
  sendLocalNotification(
    'MINTIQ - রেফারেল বোনাস! 👥',
    `আপনি ${bonus} পয়েন্ট বোনাস পেয়েছেন! বন্ধুদেরও দাওয়াত দিন! 🎉`,
    '/favicon.svg',
    'referral'
  )
}

export function sendStreakNotification(days: number) {
  sendLocalNotification(
    `MINTIQ - ${days} দিনের স্ট্রিক! 🔥`,
    `লগাতার ${days} দিন আসছেন! বোনাস পয়েন্ট পান!`,
    '/favicon.svg',
    'streak'
  )
}

export function sendLevelUpNotification(level: number, name: string) {
  sendLocalNotification(
    `MINTIQ - লেভেল আপ! 🎉`,
    `অভিনন্দন! আপনি লেভেল ${level} (${name}) এ উন্নীত হয়েছেন!`,
    '/favicon.svg',
    'level-up'
  )
}
