// Email notification service using Resend
// Install: npm install resend

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailData {
  to: string;
  subject: string;
  html: string;
  locale?: "ru" | "et";
}

export async function sendEmail({ to, subject, html }: EmailData) {
  if (!process.env.RESEND_API_KEY) {
    console.log("Email not sent (RESEND_API_KEY not configured):", { to, subject });
    return { success: false, error: "Email service not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "VEOX <noreply@veox.ee>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Error sending email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

// Email templates
export const emailTemplates = {
  // Customer emails
  customerRegistration: (locale: "ru" | "et" = "ru") => ({
    ru: {
      subject: "Добро пожаловать в VEOX!",
      html: `
        <h1>Добро пожаловать в VEOX!</h1>
        <p>Спасибо за регистрацию. Теперь вы можете создавать заказы и находить исполнителей.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/ru/create-order">Создать первый заказ</a>
      `,
    },
    et: {
      subject: "Tere tulemast VEOX-i!",
      html: `
        <h1>Tere tulemast VEOX-i!</h1>
        <p>Täname registreerumise eest. Nüüd saate luua tellimusi ja leida täitjaid.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/et/create-order">Loo esimene tellimus</a>
      `,
    },
  }[locale],

  newOffer: (locale?: "ru" | "et", orderTitle?: string, offerPrice?: number, orderId?: string) => {
    const loc = locale || "ru";
    const templates = {
      ru: {
        subject: `Новое предложение на ваш заказ: ${orderTitle || ""}`,
        html: `
          <h1>Новое предложение!</h1>
          <p>Исполнитель откликнулся на ваш заказ "${orderTitle || ""}".</p>
          ${offerPrice ? `<p>Предложенная цена: <strong>${offerPrice}€</strong></p>` : ""}
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/ru/orders/${orderId || ""}">Посмотреть предложение</a>
        `,
      },
      et: {
        subject: `Uus pakkumine teie tellimusele: ${orderTitle || ""}`,
        html: `
          <h1>Uus pakkumine!</h1>
          <p>Täitja vastas teie tellimusele "${orderTitle || ""}".</p>
          ${offerPrice ? `<p>Pakutud hind: <strong>${offerPrice}€</strong></p>` : ""}
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/et/orders/${orderId || ""}">Vaata pakkumist</a>
        `,
      },
    };
    return templates[loc];
  },

  offerAccepted: (locale?: "ru" | "et", orderTitle?: string, orderId?: string) => {
    const loc = locale || "ru";
    const templates = {
      ru: {
      subject: `Ваше предложение принято: ${orderTitle || ""}`,
      html: `
        <h1>Предложение принято!</h1>
        <p>Заказчик принял ваше предложение на заказ "${orderTitle || ""}".</p>
        <p>Теперь вы можете получить контакты заказчика и связаться с ним.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/ru/orders/${orderId || ""}">Посмотреть заказ</a>
      `,
    },
    et: {
      subject: `Teie pakkumine on vastu võetud: ${orderTitle || ""}`,
      html: `
        <h1>Pakkumine vastu võetud!</h1>
        <p>Klient võttis vastu teie pakkumise tellimusele "${orderTitle || ""}".</p>
        <p>Nüüd saate saada kliendi kontaktid ja temaga ühendust võtta.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/et/orders/${orderId || ""}">Vaata tellimust</a>
      `,
    },
    };
    return templates[loc];
  },

  reviewReminder: (locale: "ru" | "et" = "ru", orderTitle: string, orderId: string) => ({
    ru: {
      subject: "Оставьте отзыв о выполненном заказе",
      html: `
        <h1>Помогите другим выбрать исполнителя</h1>
        <p>Заказ "${orderTitle}" был выполнен. Пожалуйста, оставьте отзыв о работе исполнителя.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/ru/orders/${orderId}/review">Оставить отзыв</a>
      `,
    },
    et: {
      subject: "Jätke arvustus täidetud tellimuse kohta",
      html: `
        <h1>Aidake teistel valida täitjat</h1>
        <p>Tellimus "${orderTitle}" on täidetud. Palun jätke arvustus täitja töö kohta.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/et/orders/${orderId}/review">Jäta arvustus</a>
      `,
    },
  }[locale],

  // Performer emails
  performerRegistration: (locale: "ru" | "et" = "ru") => ({
    ru: {
      subject: "Добро пожаловать в VEOX как исполнитель!",
      html: `
        <h1>Добро пожаловать!</h1>
        <p>Спасибо за регистрацию как исполнитель. Заполните свой профиль, чтобы начать получать заказы.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/ru/performer/profile">Заполнить профиль</a>
      `,
    },
    et: {
      subject: "Tere tulemast VEOX-i täitjana!",
      html: `
        <h1>Tere tulemast!</h1>
        <p>Täname registreerumise eest täitjana. Täitke oma profiil, et hakata tellimusi saama.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/et/performer/profile">Täida profiil</a>
      `,
    },
  }[locale],

  newOrderInCategory: (locale: "ru" | "et" = "ru", orderTitle: string, orderId: string) => ({
    ru: {
      subject: `Новый заказ в вашей категории: ${orderTitle}`,
      html: `
        <h1>Новый заказ!</h1>
        <p>Появился новый заказ "${orderTitle}" в вашей категории услуг.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/ru/orders/${orderId}">Посмотреть заказ</a>
      `,
    },
    et: {
      subject: `Uus tellimus teie kategoorias: ${orderTitle}`,
      html: `
        <h1>Uus tellimus!</h1>
        <p>Ilmus uus tellimus "${orderTitle}" teie teenuste kategoorias.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/et/orders/${orderId}">Vaata tellimust</a>
      `,
    },
  }[locale],

  contactPurchaseSuccess: (locale: "ru" | "et" = "ru", orderTitle: string, orderId: string) => ({
    ru: {
      subject: "Доступ к контактам получен",
      html: `
        <h1>Оплата успешна!</h1>
        <p>Вы получили доступ к контактным данным заказчика для заказа "${orderTitle}".</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/ru/orders/${orderId}">Посмотреть контакты</a>
      `,
    },
    et: {
      subject: "Kontaktide juurdepääs saadud",
      html: `
        <h1>Makse õnnestus!</h1>
        <p>Olete saanud juurdepääsu kliendi kontaktandmetele tellimuse "${orderTitle}" jaoks.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/et/orders/${orderId}">Vaata kontakte</a>
      `,
    },
  }[locale],
};

