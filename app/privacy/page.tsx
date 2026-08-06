import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-graphite px-6 py-16 text-chalk">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-chalkDim hover:text-chalk">
          ← Начало
        </Link>
        <h1 className="mt-4 font-display text-3xl font-semibold md:text-4xl">Политика за поверителност</h1>
        <p className="mt-2 text-sm text-chalkDim">Последна редакция: [попълни дата]</p>

        <div className="mt-10 grid gap-8 text-sm leading-relaxed text-chalk">
          <section>
            <h2 className="font-display text-lg font-semibold text-amber">1. Кой обработва данните ти</h2>
            <p className="mt-2 text-chalkDim">
              [Име/фирма], [ЕИК ако има], с адрес [адрес], имейл за контакт [имейл] — администратор на
              лични данни по смисъла на Регламент (ЕС) 2016/679 (GDPR) за услугата SilaPlan.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-amber">2. Какви данни събираме</h2>
            <ul className="mt-2 grid gap-1 text-chalkDim">
              <li>· Имейл адрес и парола (при регистрация)</li>
              <li>· Лични данни за профила: пол, ръст, тегло, възраст, тренировъчен стаж</li>
              <li>· Тренировъчни данни: максимуми, история на тренировките, лични рекорди</li>
              <li>· Здравна информация, ако сам я въведеш: травми или ограничения</li>
              <li>· Технически данни: IP адрес, тип браузър (автоматично от хостинг доставчика)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-amber">3. За какво ги използваме</h2>
            <ul className="mt-2 grid gap-1 text-chalkDim">
              <li>· Да изчисляваме и показваме твоя тренировъчен план</li>
              <li>· Да пазим прогреса и историята ти между посещения</li>
              <li>· Да поддържаме профила ти и достъпа до него</li>
              <li>· Да подобряваме услугата (агрегирано, без идентификация на конкретен потребител)</li>
            </ul>
            <p className="mt-2 text-chalkDim">Не продаваме и не споделяме данните ти с трети страни за реклама.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-amber">4. Правно основание</h2>
            <p className="mt-2 text-chalkDim">
              Обработваме данните ти на основание твоето съгласие (при регистрация) и изпълнението на
              договора между нас (предоставяне на услугата, за която се регистрираш).
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-amber">5. Къде се съхраняват данните</h2>
            <p className="mt-2 text-chalkDim">
              Данните се съхраняват при доставчици на облачна инфраструктура (Supabase за базата данни,
              Vercel за хостинг на сайта). Тези доставчици могат да обработват данни извън България —
              провери актуалния им регион на съхранение и сертификации преди пускане на реална аудитория.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-amber">6. Твоите права</h2>
            <ul className="mt-2 grid gap-1 text-chalkDim">
              <li>· Достъп до данните, които пазим за теб</li>
              <li>· Поправка на неточни данни</li>
              <li>· Изтриване на профила и всички свързани данни ("право да бъдеш забравен")</li>
              <li>· Преносимост — износ на данните ти в структуриран формат</li>
              <li>· Оттегляне на съгласието по всяко време</li>
            </ul>
            <p className="mt-2 text-chalkDim">
              За да упражниш тези права, пиши ни на [имейл за контакт].
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-amber">7. Бисквитки и локално съхранение</h2>
            <p className="mt-2 text-chalkDim">
              Използваме единствено технически необходими механизми за поддържане на сесията ти (вход в
              профила). Не използваме бисквитки за реклама или проследяване.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-amber">8. Съхранение на данните</h2>
            <p className="mt-2 text-chalkDim">
              Пазим данните ти, докато имаш активен профил. При изтриване на профила изтриваме и
              свързаните лични и тренировъчни данни, освен ако закон не изисква по-дълго съхранение.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-amber">9. Промени в тази политика</h2>
            <p className="mt-2 text-chalkDim">
              При съществени промени ще те уведомим чрез сайта или имейл преди те да влязат в сила.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-amber">10. Контакт</h2>
            <p className="mt-2 text-chalkDim">
              Въпроси относно тази политика: [имейл за контакт]. Имаш право и да подадеш жалба до
              Комисията за защита на личните данни (КЗЛД), ако смяташ, че правата ти са нарушени.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
