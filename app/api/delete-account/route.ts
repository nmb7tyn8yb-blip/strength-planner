import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// =====================================================================
//  ВАЖНО: тук се ползва SUPABASE_SERVICE_ROLE_KEY — администраторски
//  ключ с пълен достъп, заобикалящ RLS. Затова целият код е сървърен
//  (API route), никога в клиентски файл. Токенът НЕ трябва да има
//  представка NEXT_PUBLIC_ — иначе би се вградил в браузърния код.
//
//  Провери имената на таблиците/колоните по-долу срещу реалната си
//  схема в Supabase — писани са по памет от дълга сесия, възможна е
//  дребна разлика в конкретно име.
// =====================================================================

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Липсва оторизация." }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");

  const supabaseAuth = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const {
    data: { user },
    error: userError,
  } = await supabaseAuth.auth.getUser(token);

  if (userError || !user) {
    return NextResponse.json({ error: "Невалидна сесия." }, { status: 401 });
  }

  const userId = user.id;
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  try {
    // 1. Готови планове → тренировки → серии → изпълнени серии (деца преди родители)
    const { data: plans } = await supabaseAdmin.from("generated_plans").select("id").eq("user_id", userId);
    const planIds = (plans ?? []).map((p) => p.id);

    if (planIds.length > 0) {
      const { data: workouts } = await supabaseAdmin
        .from("scheduled_workouts")
        .select("id")
        .in("generated_plan_id", planIds);
      const workoutIds = (workouts ?? []).map((w) => w.id);

      if (workoutIds.length > 0) {
        const { data: sets } = await supabaseAdmin
          .from("workout_sets")
          .select("id")
          .in("scheduled_workout_id", workoutIds);
        const setIds = (sets ?? []).map((s) => s.id);

        if (setIds.length > 0) {
          await supabaseAdmin.from("completed_sets").delete().in("workout_set_id", setIds);
        }
        await supabaseAdmin.from("workout_sets").delete().in("scheduled_workout_id", workoutIds);
      }
      await supabaseAdmin.from("scheduled_workouts").delete().in("generated_plan_id", planIds);
    }
    await supabaseAdmin.from("generated_plans").delete().eq("user_id", userId);

    // 2. Собствени програми → дни → упражнения
    const { data: customPrograms } = await supabaseAdmin.from("custom_programs").select("id").eq("user_id", userId);
    const customProgramIds = (customPrograms ?? []).map((c) => c.id);

    if (customProgramIds.length > 0) {
      const { data: sessions } = await supabaseAdmin
        .from("custom_program_sessions")
        .select("id")
        .in("custom_program_id", customProgramIds);
      const sessionIds = (sessions ?? []).map((s) => s.id);

      if (sessionIds.length > 0) {
        await supabaseAdmin.from("custom_program_exercises").delete().in("custom_program_session_id", sessionIds);
      }
      await supabaseAdmin.from("custom_program_sessions").delete().in("custom_program_id", customProgramIds);
    }
    await supabaseAdmin.from("custom_programs").delete().eq("user_id", userId);

    // 3. Останалите профилни таблици
    await supabaseAdmin.from("exercise_maxes").delete().eq("user_id", userId);
    await supabaseAdmin.from("athlete_profiles").delete().eq("user_id", userId);
    await supabaseAdmin.from("profiles").delete().eq("id", userId);

    // 4. Накрая — самият auth акаунт (изисква администраторски достъп)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Неуспешно изтриване." }, { status: 500 });
  }
}
