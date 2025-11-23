#!/bin/bash

# for references visit - https://www.jayteesf.com/public/temperature_alerter_notes.txt

# function definition:
temperature () {
  local raw_temp=`cat w1_slave | tail -1 | awk -F\= '{print $2}'`
  local c_temp=`echo "scale=scale(1.12);$raw_temp/1000" | bc`
  local f_temp=`echo "$c_temp*9/5+32"|bc`

  echo "$f_temp" # this is how we return a value from a function in bash
}

# function definition:
run () {
  while :;
  do
    local curr_time=`date +%s`
    local int_temp=$(temperature)

    # if you pipe the output of this program into a curl statement you can send this data to your central-database...
    echo "{temp:${int_temp},time:${curr_time}}"
    # e.g. prog1 | prog2 #<-- that will (typically) cause the output of prog1 to be the input to prog2
    # though you may have to use the dash notation for prog2, e.g. prog1 | prog2 -
    sleep 60
  done
}

run # call this function...

