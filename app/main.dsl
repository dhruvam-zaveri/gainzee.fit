context 
{
    input endpoint: string;
    // input weight: number;
    // input height: number;

    exercise: string = "";
    timer: string = "";
    duration: string = "";
}

// EXTERNAL FUNCTIONS
external function next_exercise():string;
external function next_duration():string;

start node root {
  do {
    #connectSafe($endpoint);
    #say("greeting");
    wait *;
  }
  transitions {
    say_exercise: goto say_exercise on true;
  }
}

node say_exercise 
{
  do {
    // Update exercise and duration
    var next_exercise:string = external next_exercise();
    var next_duration:string = external next_duration();
    
    // #sayText("I made it here a");
    // We have reached the end of the workout - we should finish
    if (next_exercise == "-1") {
      #sayText("Workout complete!");
      exit;
    } else if (next_duration == "-1") { 
      #sayText("Workout complete!");
      exit;
    }
    set $exercise = next_exercise;
    set $duration = next_duration;
    
    #say("exercise", {exercise:$exercise, duration:$duration});
    wait*;
  }
  transitions { 
    do_exercise: goto do_exercise on true;
    // do_exercise: goto do_exercise on #messageHasIntent("yes");
    // extra_break: goto extra_break on #messageHasIntent("break");
  }
}

node say_same_exercise {
  do {
    #sayText("Hope you're all rested up! ");
    #say("exercise", {exercise:$exercise, duration:$duration});
    // #say("confirmation");
    wait*;
  }
  transitions {
    do_exercise: goto do_exercise on true;
  }
}

node do_exercise {
  do {  
    #sayText("Starting exercise. ");
    set $timer = #startTimer(15000);
    wait*;
  }
  transitions {
    break: goto break on #isTimerExpired($timer) tags: ontick;
  }
}

// node extra_break {
//   do {
//     #sayText("Understood. Time for an extra break. Rest for 15 seconds.");
//     #say("counting_15");
//     wait*;
//   }
//   transitions {
//     say_same_exercise: goto say_same_exercise on true;
//   }
// }

digression extra_break {
  conditions {
    on #messageHasIntent("break");
  }
  do {
    #sayText("Understood. Time for an extra break. Rest for 15 seconds.");
    set $timer = #startTimer(15000);
    wait*;
  }
  transitions {
    say_same: goto say_same_exercise on #isTimerExpired($timer) tags: ontick;
  }
}

node break {
  do {
    #sayText("You did great! Now rest for a bit before the next exercise. ");
    set $timer = #startTimer(15000);
    wait*;
  }
  transitions {
    say_exercise: goto say_exercise on #isTimerExpired($timer) tags: ontick;
  }
}

digression give_up {
  conditions {
    on #messageHasIntent("give_up");
    on true tags: onclosed;
  }

  do {
    #sayText("See you next time. Bye!");
    exit;
  }
}
