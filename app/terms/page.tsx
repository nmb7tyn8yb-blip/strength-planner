import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-graphite px-6 py-16 text-chalk">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-chalkDim hover:text-chalk">
          ← Начало
        </Link>
        <h1 className="mt-4 font-display text-3xl font-semibold md:text-4xl">Общи условия</h1>
        <p className="mt-2 text-sm text-chalkDim">Последна редакция: [попълни дата]</p>

        <div className="mt-10 grid gap-8 text-sm leading-relaxed text-chalk">
          <section>
            <h2 className="font-display text-lg font-semibold text-amber">1. Приемане на условията</h2>
            <p className="mt-2 text-chalkDim">
              С регистрация и използване на StrengthPlanner ("Услугата") приемаш настоящите условия. Ако
              не си съгласен/съгласна, моля не използвай Услугата.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-amber">2. Описание на услугата</h2>
            <p className="mt-2 text-chalkDim">
              StrengthPlanner изчислява тренировъчни планове по избрана силова програма (или собствена,
              създадена от теб), следи прогреса ти и показва статистика. Изчисленията се базират на данни,
              които сам въвеждаш (максимуми, тегло, представяне).
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-amber text-rust">
              3. Важно — здравен отказ от отговорност
            </h2>
            <p className="mt-2 text-chalkDim">
              Съдържанието в Услугата е с общ, образователен характер и не представлява медицински съвет.
              Силовите тренировки носят риск от контузия. Преди да започнеш каквато и да е тренировъчна
              програма — особено ако имаш здравословни проблеми, скорошна травма или не си тренирал/а
              системно досега — се консултирай с лекар. Ти носиш пълна отговорност за преценката дали дадена
              тежест, серия или упражнение е подходящо за твоето физическо състояние. Спри незабавно при
              болка и потърси медицинска помощ при нужда.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-amber">4. Регистрация и профил</h2>
            <ul className="mt-2 grid gap-1 text-chalkDim">
              <li>· Носиш отговорност за точността на данните, които въвеждаш</li>
              <li>· Носиш отговорност за опазването на паролата си</li>
              <li>· Един профил е за лично ползване, не за споделяне</li>
              <li>· Можеш да изтриеш профила си по всяко време</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-amber">5. Точност на изчисленията</h2>
            <p className="mt-2 text-chalkDim">
              Полагаме грижа изчисленията да следват коректно логиката на всяка избрана програма. Въпреки
              това не гарантираме, че всяко изчисление е безгрешно за всеки конкретен случай. Провери
              разумността на всяко предложено тегло/повторение преди да го изпълниш.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-amber">6. Интелектуална собственост</h2>
            <p className="mt-2 text-chalkDim">
              Дизайнът, кодът и оригиналното съдържание на Услугата са собственост на [твоето име/фирма].
              Описанията на тренировъчните методи се основават на публично достъпна информация за
              съответните автори/системи и се цитират с образователна цел.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-amber">7. Ограничение на отговорността</h2>
            <p className="mt-2 text-chalkDim">
              Доколкото е позволено от закона, Услугата се предоставя "както е", без гаранции. Не носим
              отговорност за контузии, вреди или пропуснати ползи, произтичащи от използването на
              предложените тренировъчни планове.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-amber">8. Прекратяване на достъп</h2>
            <p className="mt-2 text-chalkDim">
              Можем да ограничим или прекратим достъпа при нарушение на тези условия или злоупотреба с
              Услугата.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-amber">9. Промени в условията</h2>
            <p className="mt-2 text-chalkDim">
              Можем да променяме тези условия с предизвестие чрез сайта. Продължаващото използване след
              промяна означава съгласие с новите условия.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-amber">10. Приложимо право</h2>
            <p className="mt-2 text-chalkDim">
              Тези условия се уреждат от законодателството на Република България.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-amber">11. Контакт</h2>
            <p className="mt-2 text-chalkDim">Въпроси относно тези условия: [имейл за контакт].</p>
          </section>
        </div>
      </div>
    </main>
  );
}
