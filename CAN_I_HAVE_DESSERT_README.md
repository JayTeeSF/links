Semantics

id – unique screen ID (string; e.g. start, 1, 2, …, done)

is_start – true for the “title” row (we use this for the h1 + start screen)

is_done – true for the “Q_DONE” row (the one that earns dessert)

input_type – one of:

none – just show question_text (no buttons; e.g. start/done screens)

yes_no – show question + Yes / No buttons

auto – run a named action (no user input) to decide what happens

auto_action – name of pre-defined action, e.g. CHECK_AFTER_TIME

auto_arg – argument string for the action, e.g. 20:15,America/Los_Angeles

question_text – main text for that screen (question or message)

helper_text – optional smaller text under the question

yes_next_id – screen to go to if the “yes” path is taken

yes_message – if non-empty, show this message + “Try Again” instead of going to another screen

no_next_id – screen to go to if the “no” path is taken

no_message – same idea as yes_message, but for the “no” path

Note:
For the special time cutoff screen (id=1) we’ll use input_type=auto and auto_action=CHECK_AFTER_TIME.
{current_time} and {cutoff_time} inside the message will be replaced by JS.

4) Command to generate index.html from ERB + CSV
```
cd ./can_i_have_dessert
erb index.html.erb > ../can_i_have_dessert.html
```

That’s it. It's now a fully static app (no Ruby at runtime) with the survey embedded from survey.csv.

5) Extensible auto_action ideas
Now that auto_action is a named hook, you can safely add more pre-defined behaviors that non-coders can select in the CSV:


CHECK_AFTER_TIME (already implemented)


auto_arg: "HH:MM,TimeZone"


If current time > cutoff → show yes_message


Else → go to no_next_id




CHECK_BEFORE_TIME


Mirror of CHECK_AFTER_TIME (useful if you want “no dessert before 5pm” logic).




ALLOW_ONCE_PER_DAY


Uses localStorage key like dessert_completed_YYYY-MM-DD.


If already completed today → show yes_message (e.g. “You already had dessert today”).


Else → go to no_next_id.




RANDOM_CHOICE


auto_arg: "0.5" (probability)


With that probability → show yes_message or go to yes_next_id.


Otherwise → no_next_id. (Silly, but could be used for “bonus” privileges.)




REQUIRE_SECRET_CODE (would require a minimal input field UI on that screen)


auto_arg: expected code.


If matched → yes_next_id, else no_message + Try Again.




LIMIT_TOTAL_VISITS


auto_arg: "3" – max times they can reach dessert per week; tracked via localStorage counter + timestamp.




Each of these is just another function in the autoActions map. The non-technical editor only needs to choose the auto_action name and tweak auto_arg + messages in the CSV.
