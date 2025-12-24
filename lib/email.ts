// Email notification service using Resend
// Install: npm install resend

import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface EmailData {
  to: string;
  subject: string;
  html: string;
  locale?: "ru" | "et";
}

export async function sendEmail({ to, subject, html }: EmailData) {
  if (!resend || !process.env.RESEND_API_KEY) {
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

// Email template functions
function customerRegistrationTemplate(locale?: "ru" | "et") {
  const loc = locale || "ru";
  return {
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
  }[loc];
}

function newOfferTemplate(locale?: "ru" | "et", orderTitle?: string, orderId?: string, offerPrice?: number) {
  const loc = locale || "ru";
  const title = orderTitle || "";
  const id = orderId || "";
  const templates = {
    ru: {
      subject: `Новое предложение на ваш заказ: ${title}`,
      html: `
        <h1>Новое предложение!</h1>
        <p>Исполнитель откликнулся на ваш заказ "${title}".</p>
        ${offerPrice ? `<p>Предложенная цена: <strong>${offerPrice}€</strong></p>` : ""}
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/ru/orders/${id}">Посмотреть предложение</a>
      `,
    },
    et: {
      subject: `Uus pakkumine teie tellimusele: ${title}`,
      html: `
        <h1>Uus pakkumine!</h1>
        <p>Täitja vastas teie tellimusele "${title}".</p>
        ${offerPrice ? `<p>Pakutud hind: <strong>${offerPrice}€</strong></p>` : ""}
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/et/orders/${id}">Vaata pakkumist</a>
      `,
    },
  };
  return templates[loc];
}

function offerAcceptedTemplate(locale?: "ru" | "et", orderTitle?: string, orderId?: string) {
  const loc = locale || "ru";
  const title = orderTitle || "";
  const id = orderId || "";
  const templates = {
    ru: {
      subject: `Ваше предложение принято: ${title}`,
      html: `
        <h1>Предложение принято!</h1>
        <p>Заказчик принял ваше предложение на заказ "${title}".</p>
        <p>Теперь вы можете получить контакты заказчика и связаться с ним.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/ru/orders/${id}">Посмотреть заказ</a>
      `,
    },
    et: {
      subject: `Teie pakkumine on vastu võetud: ${title}`,
      html: `
        <h1>Pakkumine vastu võetud!</h1>
        <p>Klient võttis vastu teie pakkumise tellimusele "${title}".</p>
        <p>Nüüd saate saada kliendi kontaktid ja temaga ühendust võtta.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/et/orders/${id}">Vaata tellimust</a>
      `,
    },
  };
  return templates[loc];
}

function reviewReminderTemplate(locale?: "ru" | "et", orderTitle?: string, orderId?: string) {
  const loc = locale || "ru";
  const title = orderTitle || "";
  const id = orderId || "";
  return {
    ru: {
      subject: "Оставьте отзыв о выполненном заказе",
      html: `
        <h1>Помогите другим выбрать исполнителя</h1>
        <p>Заказ "${title}" был выполнен. Пожалуйста, оставьте отзыв о работе исполнителя.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/ru/orders/${id}/review">Оставить отзыв</a>
      `,
    },
    et: {
      subject: "Jätke arvustus täidetud tellimuse kohta",
      html: `
        <h1>Aidake teistel valida täitjat</h1>
        <p>Tellimus "${title}" on täidetud. Palun jätke arvustus täitja töö kohta.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/et/orders/${id}/review">Jäta arvustus</a>
      `,
    },
  }[loc];
}

function performerRegistrationTemplate(locale?: "ru" | "et") {
  const loc = locale || "ru";
  return {
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
  }[loc];
}

function newOrderInCategoryTemplate(locale?: "ru" | "et", orderTitle?: string, orderId?: string) {
  const loc = locale || "ru";
  const title = orderTitle || "";
  const id = orderId || "";
  return {
    ru: {
      subject: `Новый заказ в вашей категории: ${title}`,
      html: `
        <h1>Новый заказ!</h1>
        <p>Появился новый заказ "${title}" в вашей категории услуг.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/ru/orders/${id}">Посмотреть заказ</a>
      `,
    },
    et: {
      subject: `Uus tellimus teie kategoorias: ${title}`,
      html: `
        <h1>Uus tellimus!</h1>
        <p>Ilmus uus tellimus "${title}" teie teenuste kategoorias.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/et/orders/${id}">Vaata tellimust</a>
      `,
    },
  }[loc];
}

function contactPurchaseSuccessTemplate(locale?: "ru" | "et", orderTitle?: string, orderId?: string) {
  const loc = locale || "ru";
  const title = orderTitle || "";
  const id = orderId || "";
  return {
    ru: {
      subject: "Доступ к контактам получен",
      html: `
        <h1>Оплата успешна!</h1>
        <p>Вы получили доступ к контактным данным заказчика для заказа "${title}".</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/ru/orders/${id}">Посмотреть контакты</a>
      `,
    },
    et: {
      subject: "Kontaktide juurdepääs saadud",
      html: `
        <h1>Makse õnnestus!</h1>
        <p>Olete saanud juurdepääsu kliendi kontaktandmetele tellimuse "${title}" jaoks.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/et/orders/${id}">Vaata kontakte</a>
      `,
    },
  }[loc];
}

export const emailTemplates = {
  // Customer emails
  customerRegistration: customerRegistrationTemplate,
  newOffer: newOfferTemplate,
  offerAccepted: offerAcceptedTemplate,
  reviewReminder: reviewReminderTemplate,

  // Performer emails
  performerRegistration: performerRegistrationTemplate,
  newOrderInCategory: newOrderInCategoryTemplate,
  contactPurchaseSuccess: contactPurchaseSuccessTemplate,
};
