import Vue from "vue";
import { distanceInWordsToNow } from "date-fns";

Vue.filter("publishedTimeToNow", time => {
  return `${distanceInWordsToNow(time)} ago`;
});

Vue.filter("commentTimeToNow", timestamp => {
  const timeElapsed = distanceInWordsToNow(timestamp, {
    includeSeconds: true
  });
  return `${timeElapsed} ago`;
});
