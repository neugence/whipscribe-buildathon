// Made-up recordings for the prototype, in the shapes the WhipScribe API
// documents at https://whipscribe.com/docs:
//   status   = GET /v1/jobs/{id}
//   result   = GET /v1/jobs/{id}/result?format=json   (full transcript)
//   preview  = the same call while the job is locked: only the opening slice
// Segment breaks for long.m4a are copied from the current screenshots,
// including the mid-sentence ones. Word times are spread evenly inside each
// segment because there is no real audio behind them.
window.WS_FIXTURES = {
 "long": {
  "status": {
   "job_id": "35f4be54-aa3e-4adc-85b7-b44f284d1fc3",
   "status": "done",
   "progress": 1.0,
   "filename": "long.m4a",
   "audio_duration_seconds": 104,
   "language": "en",
   "source": "upload",
   "speech_detected": true,
   "speech_ratio": 0.91,
   "created_at": 1789197360.0,
   "locked": false,
   "error": null
  },
  "result": {
   "text": "Thanks everyone for joining the quarterly planning review. I want to move quickly today because we have a lot to cover and several people have a hard stop at the top of the hour. First, the numbers. Revenue came in 11% above forecast. Most of that came from the enterprise segment, where three of the five deals we expected in the next quarter closed early. The self-serve business was flat. Trials were up, but conversion to paid slipped by about a point and a half. And we think that is mostly the onboarding change we shipped in July. Second, the mobile launch. We are moving it from October to the first week of November. The accessibility audit found 11 issues, four of them blocking. We will fix all four before launch, and the other seven go into the first update. Third, hiring. We have two open roles on the platform team, and we want both filled before the end of the quarter. If you know someone good, send them to me directly. Fourth, the pricing test. We ran the annual discount on half of new sign-ups for three weeks. Annual plans went up by a third, and refunds did not move, so we are rolling it out to everyone on Monday. Before we wrap up, the decisions. One, the mobile launch moves to the fourth of November. Two, the annual discount ships to everyone on Monday. Three, the July onboarding change gets a proper review next week, with the numbers from support next to the numbers from sign-ups. The action items are in the notes, and I will send the recording round after this. Thanks, everyone. Same time next quarter.",
   "language": "en",
   "segments": [
    {
     "start": 0.0,
     "end": 3.1,
     "speaker": "SPEAKER_00",
     "text": "Thanks everyone for joining the quarterly planning review.",
     "words": [
      {
       "start": 0.0,
       "end": 0.34,
       "text": "Thanks"
      },
      {
       "start": 0.37,
       "end": 0.8,
       "text": "everyone"
      },
      {
       "start": 0.83,
       "end": 1.05,
       "text": "for"
      },
      {
       "start": 1.06,
       "end": 1.45,
       "text": "joining"
      },
      {
       "start": 1.48,
       "end": 1.69,
       "text": "the"
      },
      {
       "start": 1.71,
       "end": 2.18,
       "text": "quarterly"
      },
      {
       "start": 2.22,
       "end": 2.65,
       "text": "planning"
      },
      {
       "start": 2.68,
       "end": 3.07,
       "text": "review."
      }
     ]
    },
    {
     "start": 3.4,
     "end": 7.2,
     "speaker": "SPEAKER_00",
     "text": "I want to move quickly today because we have a lot to cover and several people have a hard",
     "words": [
      {
       "start": 3.4,
       "end": 3.5,
       "text": "I"
      },
      {
       "start": 3.5,
       "end": 3.69,
       "text": "want"
      },
      {
       "start": 3.71,
       "end": 3.84,
       "text": "to"
      },
      {
       "start": 3.85,
       "end": 4.04,
       "text": "move"
      },
      {
       "start": 4.06,
       "end": 4.34,
       "text": "quickly"
      },
      {
       "start": 4.37,
       "end": 4.59,
       "text": "today"
      },
      {
       "start": 4.61,
       "end": 4.9,
       "text": "because"
      },
      {
       "start": 4.92,
       "end": 5.05,
       "text": "we"
      },
      {
       "start": 5.06,
       "end": 5.25,
       "text": "have"
      },
      {
       "start": 5.27,
       "end": 5.36,
       "text": "a"
      },
      {
       "start": 5.37,
       "end": 5.53,
       "text": "lot"
      },
      {
       "start": 5.54,
       "end": 5.67,
       "text": "to"
      },
      {
       "start": 5.68,
       "end": 5.9,
       "text": "cover"
      },
      {
       "start": 5.92,
       "end": 6.08,
       "text": "and"
      },
      {
       "start": 6.09,
       "end": 6.38,
       "text": "several"
      },
      {
       "start": 6.41,
       "end": 6.66,
       "text": "people"
      },
      {
       "start": 6.68,
       "end": 6.87,
       "text": "have"
      },
      {
       "start": 6.89,
       "end": 6.98,
       "text": "a"
      },
      {
       "start": 6.99,
       "end": 7.18,
       "text": "hard"
      }
     ]
    },
    {
     "start": 7.2,
     "end": 8.6,
     "speaker": "SPEAKER_00",
     "text": "stop at the top of the hour.",
     "words": [
      {
       "start": 7.2,
       "end": 7.41,
       "text": "stop"
      },
      {
       "start": 7.43,
       "end": 7.58,
       "text": "at"
      },
      {
       "start": 7.59,
       "end": 7.77,
       "text": "the"
      },
      {
       "start": 7.78,
       "end": 7.96,
       "text": "top"
      },
      {
       "start": 7.98,
       "end": 8.12,
       "text": "of"
      },
      {
       "start": 8.13,
       "end": 8.31,
       "text": "the"
      },
      {
       "start": 8.33,
       "end": 8.58,
       "text": "hour."
      }
     ]
    },
    {
     "start": 9.6,
     "end": 10.5,
     "speaker": "SPEAKER_00",
     "text": "First, the numbers.",
     "words": [
      {
       "start": 9.6,
       "end": 9.89,
       "text": "First,"
      },
      {
       "start": 9.91,
       "end": 10.09,
       "text": "the"
      },
      {
       "start": 10.11,
       "end": 10.47,
       "text": "numbers."
      }
     ]
    },
    {
     "start": 10.8,
     "end": 12.9,
     "speaker": "SPEAKER_00",
     "text": "Revenue came in 11% above forecast.",
     "words": [
      {
       "start": 10.8,
       "end": 11.21,
       "text": "Revenue"
      },
      {
       "start": 11.25,
       "end": 11.53,
       "text": "came"
      },
      {
       "start": 11.55,
       "end": 11.73,
       "text": "in"
      },
      {
       "start": 11.75,
       "end": 11.98,
       "text": "11%"
      },
      {
       "start": 12.0,
       "end": 12.32,
       "text": "above"
      },
      {
       "start": 12.35,
       "end": 12.86,
       "text": "forecast."
      }
     ]
    },
    {
     "start": 13.2,
     "end": 17.8,
     "speaker": "SPEAKER_00",
     "text": "Most of that came from the enterprise segment, where three of the five deals we expected",
     "words": [
      {
       "start": 13.2,
       "end": 13.44,
       "text": "Most"
      },
      {
       "start": 13.46,
       "end": 13.62,
       "text": "of"
      },
      {
       "start": 13.64,
       "end": 13.88,
       "text": "that"
      },
      {
       "start": 13.9,
       "end": 14.14,
       "text": "came"
      },
      {
       "start": 14.16,
       "end": 14.41,
       "text": "from"
      },
      {
       "start": 14.43,
       "end": 14.63,
       "text": "the"
      },
      {
       "start": 14.65,
       "end": 15.13,
       "text": "enterprise"
      },
      {
       "start": 15.17,
       "end": 15.57,
       "text": "segment,"
      },
      {
       "start": 15.61,
       "end": 15.89,
       "text": "where"
      },
      {
       "start": 15.92,
       "end": 16.2,
       "text": "three"
      },
      {
       "start": 16.22,
       "end": 16.38,
       "text": "of"
      },
      {
       "start": 16.4,
       "end": 16.6,
       "text": "the"
      },
      {
       "start": 16.62,
       "end": 16.86,
       "text": "five"
      },
      {
       "start": 16.88,
       "end": 17.16,
       "text": "deals"
      },
      {
       "start": 17.19,
       "end": 17.35,
       "text": "we"
      },
      {
       "start": 17.36,
       "end": 17.76,
       "text": "expected"
      }
     ]
    },
    {
     "start": 17.8,
     "end": 19.4,
     "speaker": "SPEAKER_00",
     "text": "in the next quarter closed early.",
     "words": [
      {
       "start": 17.8,
       "end": 17.95,
       "text": "in"
      },
      {
       "start": 17.96,
       "end": 18.14,
       "text": "the"
      },
      {
       "start": 18.16,
       "end": 18.38,
       "text": "next"
      },
      {
       "start": 18.4,
       "end": 18.73,
       "text": "quarter"
      },
      {
       "start": 18.76,
       "end": 19.05,
       "text": "closed"
      },
      {
       "start": 19.08,
       "end": 19.37,
       "text": "early."
      }
     ]
    },
    {
     "start": 20.4,
     "end": 21.9,
     "speaker": "SPEAKER_00",
     "text": "The self-serve business was flat.",
     "words": [
      {
       "start": 20.4,
       "end": 20.58,
       "text": "The"
      },
      {
       "start": 20.59,
       "end": 21.02,
       "text": "self-serve"
      },
      {
       "start": 21.05,
       "end": 21.41,
       "text": "business"
      },
      {
       "start": 21.44,
       "end": 21.62,
       "text": "was"
      },
      {
       "start": 21.63,
       "end": 21.88,
       "text": "flat."
      }
     ]
    },
    {
     "start": 22.3,
     "end": 26.0,
     "speaker": "SPEAKER_00",
     "text": "Trials were up, but conversion to paid slipped by about a point and a half.",
     "words": [
      {
       "start": 22.3,
       "end": 22.6,
       "text": "Trials"
      },
      {
       "start": 22.63,
       "end": 22.85,
       "text": "were"
      },
      {
       "start": 22.87,
       "end": 23.06,
       "text": "up,"
      },
      {
       "start": 23.07,
       "end": 23.26,
       "text": "but"
      },
      {
       "start": 23.28,
       "end": 23.72,
       "text": "conversion"
      },
      {
       "start": 23.76,
       "end": 23.91,
       "text": "to"
      },
      {
       "start": 23.93,
       "end": 24.15,
       "text": "paid"
      },
      {
       "start": 24.17,
       "end": 24.51,
       "text": "slipped"
      },
      {
       "start": 24.54,
       "end": 24.69,
       "text": "by"
      },
      {
       "start": 24.7,
       "end": 24.96,
       "text": "about"
      },
      {
       "start": 24.98,
       "end": 25.1,
       "text": "a"
      },
      {
       "start": 25.11,
       "end": 25.37,
       "text": "point"
      },
      {
       "start": 25.39,
       "end": 25.58,
       "text": "and"
      },
      {
       "start": 25.59,
       "end": 25.71,
       "text": "a"
      },
      {
       "start": 25.72,
       "end": 25.98,
       "text": "half."
      }
     ]
    },
    {
     "start": 26.4,
     "end": 28.8,
     "speaker": "SPEAKER_00",
     "text": "And we think that is mostly the onboarding change we shipped in July.",
     "words": [
      {
       "start": 26.4,
       "end": 26.53,
       "text": "And"
      },
      {
       "start": 26.54,
       "end": 26.65,
       "text": "we"
      },
      {
       "start": 26.66,
       "end": 26.85,
       "text": "think"
      },
      {
       "start": 26.86,
       "end": 27.02,
       "text": "that"
      },
      {
       "start": 27.04,
       "end": 27.14,
       "text": "is"
      },
      {
       "start": 27.15,
       "end": 27.36,
       "text": "mostly"
      },
      {
       "start": 27.38,
       "end": 27.52,
       "text": "the"
      },
      {
       "start": 27.53,
       "end": 27.85,
       "text": "onboarding"
      },
      {
       "start": 27.87,
       "end": 28.09,
       "text": "change"
      },
      {
       "start": 28.11,
       "end": 28.21,
       "text": "we"
      },
      {
       "start": 28.22,
       "end": 28.46,
       "text": "shipped"
      },
      {
       "start": 28.48,
       "end": 28.59,
       "text": "in"
      },
      {
       "start": 28.6,
       "end": 28.78,
       "text": "July."
      }
     ]
    },
    {
     "start": 29.8,
     "end": 35.2,
     "speaker": "SPEAKER_00",
     "text": "Second, the mobile launch. We are moving it from October to the first week of November.",
     "words": [
      {
       "start": 29.8,
       "end": 30.23,
       "text": "Second,"
      },
      {
       "start": 30.27,
       "end": 30.51,
       "text": "the"
      },
      {
       "start": 30.53,
       "end": 30.91,
       "text": "mobile"
      },
      {
       "start": 30.94,
       "end": 31.37,
       "text": "launch."
      },
      {
       "start": 31.41,
       "end": 31.6,
       "text": "We"
      },
      {
       "start": 31.62,
       "end": 31.86,
       "text": "are"
      },
      {
       "start": 31.88,
       "end": 32.26,
       "text": "moving"
      },
      {
       "start": 32.29,
       "end": 32.48,
       "text": "it"
      },
      {
       "start": 32.5,
       "end": 32.79,
       "text": "from"
      },
      {
       "start": 32.81,
       "end": 33.24,
       "text": "October"
      },
      {
       "start": 33.28,
       "end": 33.47,
       "text": "to"
      },
      {
       "start": 33.49,
       "end": 33.73,
       "text": "the"
      },
      {
       "start": 33.75,
       "end": 34.08,
       "text": "first"
      },
      {
       "start": 34.11,
       "end": 34.4,
       "text": "week"
      },
      {
       "start": 34.42,
       "end": 34.61,
       "text": "of"
      },
      {
       "start": 34.63,
       "end": 35.15,
       "text": "November."
      }
     ]
    },
    {
     "start": 35.6,
     "end": 38.9,
     "speaker": "SPEAKER_00",
     "text": "The accessibility audit found 11 issues, four of them blocking.",
     "words": [
      {
       "start": 35.6,
       "end": 35.81,
       "text": "The"
      },
      {
       "start": 35.82,
       "end": 36.44,
       "text": "accessibility"
      },
      {
       "start": 36.49,
       "end": 36.78,
       "text": "audit"
      },
      {
       "start": 36.8,
       "end": 37.09,
       "text": "found"
      },
      {
       "start": 37.12,
       "end": 37.28,
       "text": "11"
      },
      {
       "start": 37.29,
       "end": 37.66,
       "text": "issues,"
      },
      {
       "start": 37.7,
       "end": 37.94,
       "text": "four"
      },
      {
       "start": 37.96,
       "end": 38.13,
       "text": "of"
      },
      {
       "start": 38.14,
       "end": 38.39,
       "text": "them"
      },
      {
       "start": 38.41,
       "end": 38.86,
       "text": "blocking."
      }
     ]
    },
    {
     "start": 39.3,
     "end": 43.4,
     "speaker": "SPEAKER_00",
     "text": "We will fix all four before launch, and the other seven go into the first update.",
     "words": [
      {
       "start": 39.3,
       "end": 39.45,
       "text": "We"
      },
      {
       "start": 39.47,
       "end": 39.7,
       "text": "will"
      },
      {
       "start": 39.72,
       "end": 39.91,
       "text": "fix"
      },
      {
       "start": 39.93,
       "end": 40.12,
       "text": "all"
      },
      {
       "start": 40.14,
       "end": 40.37,
       "text": "four"
      },
      {
       "start": 40.39,
       "end": 40.7,
       "text": "before"
      },
      {
       "start": 40.72,
       "end": 41.07,
       "text": "launch,"
      },
      {
       "start": 41.1,
       "end": 41.29,
       "text": "and"
      },
      {
       "start": 41.31,
       "end": 41.5,
       "text": "the"
      },
      {
       "start": 41.52,
       "end": 41.79,
       "text": "other"
      },
      {
       "start": 41.81,
       "end": 42.08,
       "text": "seven"
      },
      {
       "start": 42.1,
       "end": 42.26,
       "text": "go"
      },
      {
       "start": 42.27,
       "end": 42.5,
       "text": "into"
      },
      {
       "start": 42.52,
       "end": 42.71,
       "text": "the"
      },
      {
       "start": 42.73,
       "end": 43.0,
       "text": "first"
      },
      {
       "start": 43.02,
       "end": 43.37,
       "text": "update."
      }
     ]
    },
    {
     "start": 44.4,
     "end": 47.4,
     "speaker": "SPEAKER_00",
     "text": "Third, hiring. We have two open roles on the platform team,",
     "words": [
      {
       "start": 44.4,
       "end": 44.71,
       "text": "Third,"
      },
      {
       "start": 44.74,
       "end": 45.09,
       "text": "hiring."
      },
      {
       "start": 45.12,
       "end": 45.27,
       "text": "We"
      },
      {
       "start": 45.29,
       "end": 45.52,
       "text": "have"
      },
      {
       "start": 45.54,
       "end": 45.74,
       "text": "two"
      },
      {
       "start": 45.75,
       "end": 45.99,
       "text": "open"
      },
      {
       "start": 46.01,
       "end": 46.28,
       "text": "roles"
      },
      {
       "start": 46.3,
       "end": 46.46,
       "text": "on"
      },
      {
       "start": 46.47,
       "end": 46.66,
       "text": "the"
      },
      {
       "start": 46.68,
       "end": 47.07,
       "text": "platform"
      },
      {
       "start": 47.1,
       "end": 47.38,
       "text": "team,"
      }
     ]
    },
    {
     "start": 47.4,
     "end": 50.6,
     "speaker": "SPEAKER_00",
     "text": "and we want both filled before the end of the quarter.",
     "words": [
      {
       "start": 47.4,
       "end": 47.62,
       "text": "and"
      },
      {
       "start": 47.64,
       "end": 47.82,
       "text": "we"
      },
      {
       "start": 47.84,
       "end": 48.1,
       "text": "want"
      },
      {
       "start": 48.13,
       "end": 48.39,
       "text": "both"
      },
      {
       "start": 48.42,
       "end": 48.78,
       "text": "filled"
      },
      {
       "start": 48.81,
       "end": 49.16,
       "text": "before"
      },
      {
       "start": 49.19,
       "end": 49.42,
       "text": "the"
      },
      {
       "start": 49.44,
       "end": 49.66,
       "text": "end"
      },
      {
       "start": 49.68,
       "end": 49.86,
       "text": "of"
      },
      {
       "start": 49.87,
       "end": 50.1,
       "text": "the"
      },
      {
       "start": 50.12,
       "end": 50.56,
       "text": "quarter."
      }
     ]
    },
    {
     "start": 51.0,
     "end": 53.8,
     "speaker": "SPEAKER_00",
     "text": "If you know someone good, send them to me directly.",
     "words": [
      {
       "start": 51.0,
       "end": 51.17,
       "text": "If"
      },
      {
       "start": 51.18,
       "end": 51.39,
       "text": "you"
      },
      {
       "start": 51.41,
       "end": 51.66,
       "text": "know"
      },
      {
       "start": 51.68,
       "end": 52.05,
       "text": "someone"
      },
      {
       "start": 52.08,
       "end": 52.37,
       "text": "good,"
      },
      {
       "start": 52.4,
       "end": 52.65,
       "text": "send"
      },
      {
       "start": 52.67,
       "end": 52.92,
       "text": "them"
      },
      {
       "start": 52.94,
       "end": 53.11,
       "text": "to"
      },
      {
       "start": 53.12,
       "end": 53.29,
       "text": "me"
      },
      {
       "start": 53.3,
       "end": 53.76,
       "text": "directly."
      }
     ]
    },
    {
     "start": 54.8,
     "end": 56.5,
     "speaker": "SPEAKER_00",
     "text": "Fourth, the pricing test.",
     "words": [
      {
       "start": 54.8,
       "end": 55.27,
       "text": "Fourth,"
      },
      {
       "start": 55.31,
       "end": 55.57,
       "text": "the"
      },
      {
       "start": 55.59,
       "end": 56.06,
       "text": "pricing"
      },
      {
       "start": 56.1,
       "end": 56.47,
       "text": "test."
      }
     ]
    },
    {
     "start": 56.9,
     "end": 61.3,
     "speaker": "SPEAKER_00",
     "text": "We ran the annual discount on half of new sign-ups for three weeks.",
     "words": [
      {
       "start": 56.9,
       "end": 57.1,
       "text": "We"
      },
      {
       "start": 57.12,
       "end": 57.37,
       "text": "ran"
      },
      {
       "start": 57.39,
       "end": 57.64,
       "text": "the"
      },
      {
       "start": 57.66,
       "end": 58.06,
       "text": "annual"
      },
      {
       "start": 58.1,
       "end": 58.59,
       "text": "discount"
      },
      {
       "start": 58.64,
       "end": 58.84,
       "text": "on"
      },
      {
       "start": 58.86,
       "end": 59.16,
       "text": "half"
      },
      {
       "start": 59.18,
       "end": 59.38,
       "text": "of"
      },
      {
       "start": 59.4,
       "end": 59.65,
       "text": "new"
      },
      {
       "start": 59.67,
       "end": 60.17,
       "text": "sign-ups"
      },
      {
       "start": 60.21,
       "end": 60.46,
       "text": "for"
      },
      {
       "start": 60.49,
       "end": 60.84,
       "text": "three"
      },
      {
       "start": 60.87,
       "end": 61.27,
       "text": "weeks."
      }
     ]
    },
    {
     "start": 61.7,
     "end": 65.4,
     "speaker": "SPEAKER_00",
     "text": "Annual plans went up by a third, and refunds did not move,",
     "words": [
      {
       "start": 61.7,
       "end": 62.08,
       "text": "Annual"
      },
      {
       "start": 62.12,
       "end": 62.45,
       "text": "plans"
      },
      {
       "start": 62.48,
       "end": 62.77,
       "text": "went"
      },
      {
       "start": 62.79,
       "end": 62.99,
       "text": "up"
      },
      {
       "start": 63.0,
       "end": 63.19,
       "text": "by"
      },
      {
       "start": 63.21,
       "end": 63.36,
       "text": "a"
      },
      {
       "start": 63.37,
       "end": 63.75,
       "text": "third,"
      },
      {
       "start": 63.78,
       "end": 64.02,
       "text": "and"
      },
      {
       "start": 64.05,
       "end": 64.48,
       "text": "refunds"
      },
      {
       "start": 64.51,
       "end": 64.75,
       "text": "did"
      },
      {
       "start": 64.77,
       "end": 65.01,
       "text": "not"
      },
      {
       "start": 65.04,
       "end": 65.37,
       "text": "move,"
      }
     ]
    },
    {
     "start": 65.4,
     "end": 68.4,
     "speaker": "SPEAKER_00",
     "text": "so we are rolling it out to everyone on Monday.",
     "words": [
      {
       "start": 65.4,
       "end": 65.59,
       "text": "so"
      },
      {
       "start": 65.61,
       "end": 65.8,
       "text": "we"
      },
      {
       "start": 65.81,
       "end": 66.05,
       "text": "are"
      },
      {
       "start": 66.07,
       "end": 66.5,
       "text": "rolling"
      },
      {
       "start": 66.54,
       "end": 66.73,
       "text": "it"
      },
      {
       "start": 66.74,
       "end": 66.98,
       "text": "out"
      },
      {
       "start": 67.0,
       "end": 67.19,
       "text": "to"
      },
      {
       "start": 67.21,
       "end": 67.69,
       "text": "everyone"
      },
      {
       "start": 67.73,
       "end": 67.92,
       "text": "on"
      },
      {
       "start": 67.93,
       "end": 68.36,
       "text": "Monday."
      }
     ]
    },
    {
     "start": 69.5,
     "end": 71.4,
     "speaker": "SPEAKER_00",
     "text": "Before we wrap up, the decisions.",
     "words": [
      {
       "start": 69.5,
       "end": 69.85,
       "text": "Before"
      },
      {
       "start": 69.88,
       "end": 70.05,
       "text": "we"
      },
      {
       "start": 70.07,
       "end": 70.33,
       "text": "wrap"
      },
      {
       "start": 70.35,
       "end": 70.57,
       "text": "up,"
      },
      {
       "start": 70.59,
       "end": 70.81,
       "text": "the"
      },
      {
       "start": 70.83,
       "end": 71.35,
       "text": "decisions."
      }
     ]
    },
    {
     "start": 71.8,
     "end": 75.2,
     "speaker": "SPEAKER_00",
     "text": "One, the mobile launch moves to the fourth of November.",
     "words": [
      {
       "start": 71.8,
       "end": 72.08,
       "text": "One,"
      },
      {
       "start": 72.11,
       "end": 72.35,
       "text": "the"
      },
      {
       "start": 72.37,
       "end": 72.75,
       "text": "mobile"
      },
      {
       "start": 72.78,
       "end": 73.16,
       "text": "launch"
      },
      {
       "start": 73.19,
       "end": 73.52,
       "text": "moves"
      },
      {
       "start": 73.55,
       "end": 73.74,
       "text": "to"
      },
      {
       "start": 73.76,
       "end": 73.99,
       "text": "the"
      },
      {
       "start": 74.02,
       "end": 74.39,
       "text": "fourth"
      },
      {
       "start": 74.43,
       "end": 74.62,
       "text": "of"
      },
      {
       "start": 74.63,
       "end": 75.15,
       "text": "November."
      }
     ]
    },
    {
     "start": 75.6,
     "end": 78.9,
     "speaker": "SPEAKER_00",
     "text": "Two, the annual discount ships to everyone on Monday.",
     "words": [
      {
       "start": 75.6,
       "end": 75.89,
       "text": "Two,"
      },
      {
       "start": 75.91,
       "end": 76.16,
       "text": "the"
      },
      {
       "start": 76.18,
       "end": 76.56,
       "text": "annual"
      },
      {
       "start": 76.6,
       "end": 77.08,
       "text": "discount"
      },
      {
       "start": 77.12,
       "end": 77.46,
       "text": "ships"
      },
      {
       "start": 77.49,
       "end": 77.68,
       "text": "to"
      },
      {
       "start": 77.7,
       "end": 78.18,
       "text": "everyone"
      },
      {
       "start": 78.22,
       "end": 78.41,
       "text": "on"
      },
      {
       "start": 78.43,
       "end": 78.86,
       "text": "Monday."
      }
     ]
    },
    {
     "start": 79.3,
     "end": 84.1,
     "speaker": "SPEAKER_00",
     "text": "Three, the July onboarding change gets a proper review next week,",
     "words": [
      {
       "start": 79.3,
       "end": 79.76,
       "text": "Three,"
      },
      {
       "start": 79.8,
       "end": 80.09,
       "text": "the"
      },
      {
       "start": 80.11,
       "end": 80.45,
       "text": "July"
      },
      {
       "start": 80.48,
       "end": 81.17,
       "text": "onboarding"
      },
      {
       "start": 81.23,
       "end": 81.69,
       "text": "change"
      },
      {
       "start": 81.73,
       "end": 82.08,
       "text": "gets"
      },
      {
       "start": 82.11,
       "end": 82.28,
       "text": "a"
      },
      {
       "start": 82.29,
       "end": 82.75,
       "text": "proper"
      },
      {
       "start": 82.79,
       "end": 83.25,
       "text": "review"
      },
      {
       "start": 83.29,
       "end": 83.63,
       "text": "next"
      },
      {
       "start": 83.66,
       "end": 84.07,
       "text": "week,"
      }
     ]
    },
    {
     "start": 84.1,
     "end": 88.5,
     "speaker": "SPEAKER_00",
     "text": "with the numbers from support next to the numbers from sign-ups.",
     "words": [
      {
       "start": 84.1,
       "end": 84.42,
       "text": "with"
      },
      {
       "start": 84.45,
       "end": 84.71,
       "text": "the"
      },
      {
       "start": 84.74,
       "end": 85.22,
       "text": "numbers"
      },
      {
       "start": 85.26,
       "end": 85.58,
       "text": "from"
      },
      {
       "start": 85.61,
       "end": 86.08,
       "text": "support"
      },
      {
       "start": 86.13,
       "end": 86.45,
       "text": "next"
      },
      {
       "start": 86.47,
       "end": 86.69,
       "text": "to"
      },
      {
       "start": 86.71,
       "end": 86.97,
       "text": "the"
      },
      {
       "start": 86.99,
       "end": 87.47,
       "text": "numbers"
      },
      {
       "start": 87.52,
       "end": 87.84,
       "text": "from"
      },
      {
       "start": 87.86,
       "end": 88.45,
       "text": "sign-ups."
      }
     ]
    },
    {
     "start": 89.6,
     "end": 95.3,
     "speaker": "SPEAKER_00",
     "text": "The action items are in the notes, and I will send the recording round after this.",
     "words": [
      {
       "start": 89.6,
       "end": 89.86,
       "text": "The"
      },
      {
       "start": 89.89,
       "end": 90.31,
       "text": "action"
      },
      {
       "start": 90.35,
       "end": 90.72,
       "text": "items"
      },
      {
       "start": 90.75,
       "end": 91.02,
       "text": "are"
      },
      {
       "start": 91.04,
       "end": 91.25,
       "text": "in"
      },
      {
       "start": 91.27,
       "end": 91.53,
       "text": "the"
      },
      {
       "start": 91.56,
       "end": 91.98,
       "text": "notes,"
      },
      {
       "start": 92.02,
       "end": 92.28,
       "text": "and"
      },
      {
       "start": 92.31,
       "end": 92.46,
       "text": "I"
      },
      {
       "start": 92.48,
       "end": 92.8,
       "text": "will"
      },
      {
       "start": 92.82,
       "end": 93.14,
       "text": "send"
      },
      {
       "start": 93.17,
       "end": 93.43,
       "text": "the"
      },
      {
       "start": 93.46,
       "end": 94.04,
       "text": "recording"
      },
      {
       "start": 94.09,
       "end": 94.46,
       "text": "round"
      },
      {
       "start": 94.49,
       "end": 94.86,
       "text": "after"
      },
      {
       "start": 94.9,
       "end": 95.27,
       "text": "this."
      }
     ]
    },
    {
     "start": 95.9,
     "end": 99.8,
     "speaker": "SPEAKER_00",
     "text": "Thanks, everyone. Same time next quarter.",
     "words": [
      {
       "start": 95.9,
       "end": 96.57,
       "text": "Thanks,"
      },
      {
       "start": 96.63,
       "end": 97.45,
       "text": "everyone."
      },
      {
       "start": 97.53,
       "end": 97.97,
       "text": "Same"
      },
      {
       "start": 98.01,
       "end": 98.46,
       "text": "time"
      },
      {
       "start": 98.5,
       "end": 98.95,
       "text": "next"
      },
      {
       "start": 98.99,
       "end": 99.73,
       "text": "quarter."
      }
     ]
    }
   ]
  },
  "preview": {
   "text": "Thanks everyone for joining the quarterly planning review. I want to move quickly today because we have a lot to cover and several people have a hard stop at the top of the hour. First, the numbers. Revenue came in 11% above forecast. Most of that came from the enterprise segment, where three of the five deals we expected in the next quarter closed early. The self-serve business was flat. Trials were up, but conversion to paid slipped by about a point and a half. And we think that is mostly the onboarding change we shipped in July. Second, the mobile launch. We are moving it from October to the first week of November. The accessibility audit found 11 issues, four of them blocking.",
   "language": "en",
   "segments": [
    {
     "start": 0.0,
     "end": 3.1,
     "speaker": "SPEAKER_00",
     "text": "Thanks everyone for joining the quarterly planning review.",
     "words": [
      {
       "start": 0.0,
       "end": 0.34,
       "text": "Thanks"
      },
      {
       "start": 0.37,
       "end": 0.8,
       "text": "everyone"
      },
      {
       "start": 0.83,
       "end": 1.05,
       "text": "for"
      },
      {
       "start": 1.06,
       "end": 1.45,
       "text": "joining"
      },
      {
       "start": 1.48,
       "end": 1.69,
       "text": "the"
      },
      {
       "start": 1.71,
       "end": 2.18,
       "text": "quarterly"
      },
      {
       "start": 2.22,
       "end": 2.65,
       "text": "planning"
      },
      {
       "start": 2.68,
       "end": 3.07,
       "text": "review."
      }
     ]
    },
    {
     "start": 3.4,
     "end": 7.2,
     "speaker": "SPEAKER_00",
     "text": "I want to move quickly today because we have a lot to cover and several people have a hard",
     "words": [
      {
       "start": 3.4,
       "end": 3.5,
       "text": "I"
      },
      {
       "start": 3.5,
       "end": 3.69,
       "text": "want"
      },
      {
       "start": 3.71,
       "end": 3.84,
       "text": "to"
      },
      {
       "start": 3.85,
       "end": 4.04,
       "text": "move"
      },
      {
       "start": 4.06,
       "end": 4.34,
       "text": "quickly"
      },
      {
       "start": 4.37,
       "end": 4.59,
       "text": "today"
      },
      {
       "start": 4.61,
       "end": 4.9,
       "text": "because"
      },
      {
       "start": 4.92,
       "end": 5.05,
       "text": "we"
      },
      {
       "start": 5.06,
       "end": 5.25,
       "text": "have"
      },
      {
       "start": 5.27,
       "end": 5.36,
       "text": "a"
      },
      {
       "start": 5.37,
       "end": 5.53,
       "text": "lot"
      },
      {
       "start": 5.54,
       "end": 5.67,
       "text": "to"
      },
      {
       "start": 5.68,
       "end": 5.9,
       "text": "cover"
      },
      {
       "start": 5.92,
       "end": 6.08,
       "text": "and"
      },
      {
       "start": 6.09,
       "end": 6.38,
       "text": "several"
      },
      {
       "start": 6.41,
       "end": 6.66,
       "text": "people"
      },
      {
       "start": 6.68,
       "end": 6.87,
       "text": "have"
      },
      {
       "start": 6.89,
       "end": 6.98,
       "text": "a"
      },
      {
       "start": 6.99,
       "end": 7.18,
       "text": "hard"
      }
     ]
    },
    {
     "start": 7.2,
     "end": 8.6,
     "speaker": "SPEAKER_00",
     "text": "stop at the top of the hour.",
     "words": [
      {
       "start": 7.2,
       "end": 7.41,
       "text": "stop"
      },
      {
       "start": 7.43,
       "end": 7.58,
       "text": "at"
      },
      {
       "start": 7.59,
       "end": 7.77,
       "text": "the"
      },
      {
       "start": 7.78,
       "end": 7.96,
       "text": "top"
      },
      {
       "start": 7.98,
       "end": 8.12,
       "text": "of"
      },
      {
       "start": 8.13,
       "end": 8.31,
       "text": "the"
      },
      {
       "start": 8.33,
       "end": 8.58,
       "text": "hour."
      }
     ]
    },
    {
     "start": 9.6,
     "end": 10.5,
     "speaker": "SPEAKER_00",
     "text": "First, the numbers.",
     "words": [
      {
       "start": 9.6,
       "end": 9.89,
       "text": "First,"
      },
      {
       "start": 9.91,
       "end": 10.09,
       "text": "the"
      },
      {
       "start": 10.11,
       "end": 10.47,
       "text": "numbers."
      }
     ]
    },
    {
     "start": 10.8,
     "end": 12.9,
     "speaker": "SPEAKER_00",
     "text": "Revenue came in 11% above forecast.",
     "words": [
      {
       "start": 10.8,
       "end": 11.21,
       "text": "Revenue"
      },
      {
       "start": 11.25,
       "end": 11.53,
       "text": "came"
      },
      {
       "start": 11.55,
       "end": 11.73,
       "text": "in"
      },
      {
       "start": 11.75,
       "end": 11.98,
       "text": "11%"
      },
      {
       "start": 12.0,
       "end": 12.32,
       "text": "above"
      },
      {
       "start": 12.35,
       "end": 12.86,
       "text": "forecast."
      }
     ]
    },
    {
     "start": 13.2,
     "end": 17.8,
     "speaker": "SPEAKER_00",
     "text": "Most of that came from the enterprise segment, where three of the five deals we expected",
     "words": [
      {
       "start": 13.2,
       "end": 13.44,
       "text": "Most"
      },
      {
       "start": 13.46,
       "end": 13.62,
       "text": "of"
      },
      {
       "start": 13.64,
       "end": 13.88,
       "text": "that"
      },
      {
       "start": 13.9,
       "end": 14.14,
       "text": "came"
      },
      {
       "start": 14.16,
       "end": 14.41,
       "text": "from"
      },
      {
       "start": 14.43,
       "end": 14.63,
       "text": "the"
      },
      {
       "start": 14.65,
       "end": 15.13,
       "text": "enterprise"
      },
      {
       "start": 15.17,
       "end": 15.57,
       "text": "segment,"
      },
      {
       "start": 15.61,
       "end": 15.89,
       "text": "where"
      },
      {
       "start": 15.92,
       "end": 16.2,
       "text": "three"
      },
      {
       "start": 16.22,
       "end": 16.38,
       "text": "of"
      },
      {
       "start": 16.4,
       "end": 16.6,
       "text": "the"
      },
      {
       "start": 16.62,
       "end": 16.86,
       "text": "five"
      },
      {
       "start": 16.88,
       "end": 17.16,
       "text": "deals"
      },
      {
       "start": 17.19,
       "end": 17.35,
       "text": "we"
      },
      {
       "start": 17.36,
       "end": 17.76,
       "text": "expected"
      }
     ]
    },
    {
     "start": 17.8,
     "end": 19.4,
     "speaker": "SPEAKER_00",
     "text": "in the next quarter closed early.",
     "words": [
      {
       "start": 17.8,
       "end": 17.95,
       "text": "in"
      },
      {
       "start": 17.96,
       "end": 18.14,
       "text": "the"
      },
      {
       "start": 18.16,
       "end": 18.38,
       "text": "next"
      },
      {
       "start": 18.4,
       "end": 18.73,
       "text": "quarter"
      },
      {
       "start": 18.76,
       "end": 19.05,
       "text": "closed"
      },
      {
       "start": 19.08,
       "end": 19.37,
       "text": "early."
      }
     ]
    },
    {
     "start": 20.4,
     "end": 21.9,
     "speaker": "SPEAKER_00",
     "text": "The self-serve business was flat.",
     "words": [
      {
       "start": 20.4,
       "end": 20.58,
       "text": "The"
      },
      {
       "start": 20.59,
       "end": 21.02,
       "text": "self-serve"
      },
      {
       "start": 21.05,
       "end": 21.41,
       "text": "business"
      },
      {
       "start": 21.44,
       "end": 21.62,
       "text": "was"
      },
      {
       "start": 21.63,
       "end": 21.88,
       "text": "flat."
      }
     ]
    },
    {
     "start": 22.3,
     "end": 26.0,
     "speaker": "SPEAKER_00",
     "text": "Trials were up, but conversion to paid slipped by about a point and a half.",
     "words": [
      {
       "start": 22.3,
       "end": 22.6,
       "text": "Trials"
      },
      {
       "start": 22.63,
       "end": 22.85,
       "text": "were"
      },
      {
       "start": 22.87,
       "end": 23.06,
       "text": "up,"
      },
      {
       "start": 23.07,
       "end": 23.26,
       "text": "but"
      },
      {
       "start": 23.28,
       "end": 23.72,
       "text": "conversion"
      },
      {
       "start": 23.76,
       "end": 23.91,
       "text": "to"
      },
      {
       "start": 23.93,
       "end": 24.15,
       "text": "paid"
      },
      {
       "start": 24.17,
       "end": 24.51,
       "text": "slipped"
      },
      {
       "start": 24.54,
       "end": 24.69,
       "text": "by"
      },
      {
       "start": 24.7,
       "end": 24.96,
       "text": "about"
      },
      {
       "start": 24.98,
       "end": 25.1,
       "text": "a"
      },
      {
       "start": 25.11,
       "end": 25.37,
       "text": "point"
      },
      {
       "start": 25.39,
       "end": 25.58,
       "text": "and"
      },
      {
       "start": 25.59,
       "end": 25.71,
       "text": "a"
      },
      {
       "start": 25.72,
       "end": 25.98,
       "text": "half."
      }
     ]
    },
    {
     "start": 26.4,
     "end": 28.8,
     "speaker": "SPEAKER_00",
     "text": "And we think that is mostly the onboarding change we shipped in July.",
     "words": [
      {
       "start": 26.4,
       "end": 26.53,
       "text": "And"
      },
      {
       "start": 26.54,
       "end": 26.65,
       "text": "we"
      },
      {
       "start": 26.66,
       "end": 26.85,
       "text": "think"
      },
      {
       "start": 26.86,
       "end": 27.02,
       "text": "that"
      },
      {
       "start": 27.04,
       "end": 27.14,
       "text": "is"
      },
      {
       "start": 27.15,
       "end": 27.36,
       "text": "mostly"
      },
      {
       "start": 27.38,
       "end": 27.52,
       "text": "the"
      },
      {
       "start": 27.53,
       "end": 27.85,
       "text": "onboarding"
      },
      {
       "start": 27.87,
       "end": 28.09,
       "text": "change"
      },
      {
       "start": 28.11,
       "end": 28.21,
       "text": "we"
      },
      {
       "start": 28.22,
       "end": 28.46,
       "text": "shipped"
      },
      {
       "start": 28.48,
       "end": 28.59,
       "text": "in"
      },
      {
       "start": 28.6,
       "end": 28.78,
       "text": "July."
      }
     ]
    },
    {
     "start": 29.8,
     "end": 35.2,
     "speaker": "SPEAKER_00",
     "text": "Second, the mobile launch. We are moving it from October to the first week of November.",
     "words": [
      {
       "start": 29.8,
       "end": 30.23,
       "text": "Second,"
      },
      {
       "start": 30.27,
       "end": 30.51,
       "text": "the"
      },
      {
       "start": 30.53,
       "end": 30.91,
       "text": "mobile"
      },
      {
       "start": 30.94,
       "end": 31.37,
       "text": "launch."
      },
      {
       "start": 31.41,
       "end": 31.6,
       "text": "We"
      },
      {
       "start": 31.62,
       "end": 31.86,
       "text": "are"
      },
      {
       "start": 31.88,
       "end": 32.26,
       "text": "moving"
      },
      {
       "start": 32.29,
       "end": 32.48,
       "text": "it"
      },
      {
       "start": 32.5,
       "end": 32.79,
       "text": "from"
      },
      {
       "start": 32.81,
       "end": 33.24,
       "text": "October"
      },
      {
       "start": 33.28,
       "end": 33.47,
       "text": "to"
      },
      {
       "start": 33.49,
       "end": 33.73,
       "text": "the"
      },
      {
       "start": 33.75,
       "end": 34.08,
       "text": "first"
      },
      {
       "start": 34.11,
       "end": 34.4,
       "text": "week"
      },
      {
       "start": 34.42,
       "end": 34.61,
       "text": "of"
      },
      {
       "start": 34.63,
       "end": 35.15,
       "text": "November."
      }
     ]
    },
    {
     "start": 35.6,
     "end": 38.9,
     "speaker": "SPEAKER_00",
     "text": "The accessibility audit found 11 issues, four of them blocking.",
     "words": [
      {
       "start": 35.6,
       "end": 35.81,
       "text": "The"
      },
      {
       "start": 35.82,
       "end": 36.44,
       "text": "accessibility"
      },
      {
       "start": 36.49,
       "end": 36.78,
       "text": "audit"
      },
      {
       "start": 36.8,
       "end": 37.09,
       "text": "found"
      },
      {
       "start": 37.12,
       "end": 37.28,
       "text": "11"
      },
      {
       "start": 37.29,
       "end": 37.66,
       "text": "issues,"
      },
      {
       "start": 37.7,
       "end": 37.94,
       "text": "four"
      },
      {
       "start": 37.96,
       "end": 38.13,
       "text": "of"
      },
      {
       "start": 38.14,
       "end": 38.39,
       "text": "them"
      },
      {
       "start": 38.41,
       "end": 38.86,
       "text": "blocking."
      }
     ]
    }
   ]
  }
 },
 "meeting": {
  "status": {
   "job_id": "9c1d2e7a-5b41-4f0e-9a63-0d8e2f6b7c15",
   "status": "done",
   "progress": 1.0,
   "filename": "Q3 planning review.m4a",
   "audio_duration_seconds": 104,
   "language": "en",
   "source": "upload",
   "speech_detected": true,
   "speech_ratio": 0.91,
   "created_at": 1789197360.0,
   "locked": false,
   "error": null
  },
  "result": {
   "text": "Thanks everyone for joining the quarterly planning review. I want to move quickly today because we have a lot to cover and several people have a hard stop at the top of the hour. First, the numbers. Revenue came in 11% above forecast. Most of that came from the enterprise segment, where three of the five deals we expected in the next quarter closed early. The self-serve business was flat. Trials were up, but conversion to paid slipped by about a point and a half. Do we know why? We think it is mostly the onboarding change we shipped in July. Okay. Second, the mobile launch. We are moving it from October to the first week of November. The accessibility audit found 11 issues, four of them blocking. We will fix all four before launch, and the other seven go into the first update. Is November safe for the enterprise renewals? Yes. None of them depend on the mobile app until January. Good. Third, hiring. We have two open roles on the platform team, and I want both filled this quarter. Fourth, the pricing test. We ran the annual discount on half of new sign-ups for three weeks. Annual plans went up by a third, and refunds did not move, so we would like to roll it out to everyone on Monday. No objection from finance. Then that is decided. Before we wrap up, the decisions. The mobile launch moves to the fourth of November, the annual discount ships on Monday, and the July onboarding change gets a proper review next week. I will bring the support numbers to that review. Thanks. The action items are in the notes, and I will send the recording round after this.",
   "language": "en",
   "segments": [
    {
     "start": 0.0,
     "end": 3.1,
     "speaker": "SPEAKER_00",
     "text": "Thanks everyone for joining the quarterly planning review.",
     "words": [
      {
       "start": 0.0,
       "end": 0.34,
       "text": "Thanks"
      },
      {
       "start": 0.37,
       "end": 0.8,
       "text": "everyone"
      },
      {
       "start": 0.83,
       "end": 1.05,
       "text": "for"
      },
      {
       "start": 1.06,
       "end": 1.45,
       "text": "joining"
      },
      {
       "start": 1.48,
       "end": 1.69,
       "text": "the"
      },
      {
       "start": 1.71,
       "end": 2.18,
       "text": "quarterly"
      },
      {
       "start": 2.22,
       "end": 2.65,
       "text": "planning"
      },
      {
       "start": 2.68,
       "end": 3.07,
       "text": "review."
      }
     ]
    },
    {
     "start": 3.4,
     "end": 8.6,
     "speaker": "SPEAKER_00",
     "text": "I want to move quickly today because we have a lot to cover and several people have a hard stop at the top of the hour.",
     "words": [
      {
       "start": 3.4,
       "end": 3.5,
       "text": "I"
      },
      {
       "start": 3.51,
       "end": 3.7,
       "text": "want"
      },
      {
       "start": 3.72,
       "end": 3.85,
       "text": "to"
      },
      {
       "start": 3.86,
       "end": 4.06,
       "text": "move"
      },
      {
       "start": 4.08,
       "end": 4.37,
       "text": "quickly"
      },
      {
       "start": 4.4,
       "end": 4.63,
       "text": "today"
      },
      {
       "start": 4.65,
       "end": 4.94,
       "text": "because"
      },
      {
       "start": 4.97,
       "end": 5.1,
       "text": "we"
      },
      {
       "start": 5.11,
       "end": 5.31,
       "text": "have"
      },
      {
       "start": 5.32,
       "end": 5.42,
       "text": "a"
      },
      {
       "start": 5.43,
       "end": 5.59,
       "text": "lot"
      },
      {
       "start": 5.61,
       "end": 5.74,
       "text": "to"
      },
      {
       "start": 5.75,
       "end": 5.98,
       "text": "cover"
      },
      {
       "start": 6.0,
       "end": 6.16,
       "text": "and"
      },
      {
       "start": 6.18,
       "end": 6.47,
       "text": "several"
      },
      {
       "start": 6.5,
       "end": 6.76,
       "text": "people"
      },
      {
       "start": 6.78,
       "end": 6.98,
       "text": "have"
      },
      {
       "start": 7.0,
       "end": 7.1,
       "text": "a"
      },
      {
       "start": 7.1,
       "end": 7.3,
       "text": "hard"
      },
      {
       "start": 7.32,
       "end": 7.51,
       "text": "stop"
      },
      {
       "start": 7.53,
       "end": 7.66,
       "text": "at"
      },
      {
       "start": 7.67,
       "end": 7.84,
       "text": "the"
      },
      {
       "start": 7.85,
       "end": 8.02,
       "text": "top"
      },
      {
       "start": 8.03,
       "end": 8.16,
       "text": "of"
      },
      {
       "start": 8.17,
       "end": 8.34,
       "text": "the"
      },
      {
       "start": 8.35,
       "end": 8.58,
       "text": "hour."
      }
     ]
    },
    {
     "start": 9.0,
     "end": 10.1,
     "speaker": "SPEAKER_00",
     "text": "First, the numbers.",
     "words": [
      {
       "start": 9.0,
       "end": 9.35,
       "text": "First,"
      },
      {
       "start": 9.38,
       "end": 9.6,
       "text": "the"
      },
      {
       "start": 9.62,
       "end": 10.06,
       "text": "numbers."
      }
     ]
    },
    {
     "start": 10.6,
     "end": 12.8,
     "speaker": "SPEAKER_01",
     "text": "Revenue came in 11% above forecast.",
     "words": [
      {
       "start": 10.6,
       "end": 11.03,
       "text": "Revenue"
      },
      {
       "start": 11.07,
       "end": 11.36,
       "text": "came"
      },
      {
       "start": 11.39,
       "end": 11.58,
       "text": "in"
      },
      {
       "start": 11.6,
       "end": 11.84,
       "text": "11%"
      },
      {
       "start": 11.86,
       "end": 12.19,
       "text": "above"
      },
      {
       "start": 12.22,
       "end": 12.75,
       "text": "forecast."
      }
     ]
    },
    {
     "start": 13.1,
     "end": 19.4,
     "speaker": "SPEAKER_01",
     "text": "Most of that came from the enterprise segment, where three of the five deals we expected in the next quarter closed early.",
     "words": [
      {
       "start": 13.1,
       "end": 13.34,
       "text": "Most"
      },
      {
       "start": 13.36,
       "end": 13.52,
       "text": "of"
      },
      {
       "start": 13.53,
       "end": 13.77,
       "text": "that"
      },
      {
       "start": 13.8,
       "end": 14.04,
       "text": "came"
      },
      {
       "start": 14.06,
       "end": 14.3,
       "text": "from"
      },
      {
       "start": 14.32,
       "end": 14.52,
       "text": "the"
      },
      {
       "start": 14.53,
       "end": 15.01,
       "text": "enterprise"
      },
      {
       "start": 15.06,
       "end": 15.45,
       "text": "segment,"
      },
      {
       "start": 15.49,
       "end": 15.77,
       "text": "where"
      },
      {
       "start": 15.79,
       "end": 16.07,
       "text": "three"
      },
      {
       "start": 16.1,
       "end": 16.26,
       "text": "of"
      },
      {
       "start": 16.27,
       "end": 16.47,
       "text": "the"
      },
      {
       "start": 16.49,
       "end": 16.73,
       "text": "five"
      },
      {
       "start": 16.75,
       "end": 17.03,
       "text": "deals"
      },
      {
       "start": 17.05,
       "end": 17.21,
       "text": "we"
      },
      {
       "start": 17.23,
       "end": 17.63,
       "text": "expected"
      },
      {
       "start": 17.66,
       "end": 17.82,
       "text": "in"
      },
      {
       "start": 17.84,
       "end": 18.04,
       "text": "the"
      },
      {
       "start": 18.05,
       "end": 18.29,
       "text": "next"
      },
      {
       "start": 18.31,
       "end": 18.67,
       "text": "quarter"
      },
      {
       "start": 18.7,
       "end": 19.02,
       "text": "closed"
      },
      {
       "start": 19.05,
       "end": 19.37,
       "text": "early."
      }
     ]
    },
    {
     "start": 19.9,
     "end": 21.5,
     "speaker": "SPEAKER_02",
     "text": "The self-serve business was flat.",
     "words": [
      {
       "start": 19.9,
       "end": 20.09,
       "text": "The"
      },
      {
       "start": 20.11,
       "end": 20.56,
       "text": "self-serve"
      },
      {
       "start": 20.6,
       "end": 20.97,
       "text": "business"
      },
      {
       "start": 21.01,
       "end": 21.2,
       "text": "was"
      },
      {
       "start": 21.21,
       "end": 21.48,
       "text": "flat."
      }
     ]
    },
    {
     "start": 21.9,
     "end": 25.7,
     "speaker": "SPEAKER_02",
     "text": "Trials were up, but conversion to paid slipped by about a point and a half.",
     "words": [
      {
       "start": 21.9,
       "end": 22.21,
       "text": "Trials"
      },
      {
       "start": 22.23,
       "end": 22.46,
       "text": "were"
      },
      {
       "start": 22.48,
       "end": 22.68,
       "text": "up,"
      },
      {
       "start": 22.69,
       "end": 22.89,
       "text": "but"
      },
      {
       "start": 22.9,
       "end": 23.36,
       "text": "conversion"
      },
      {
       "start": 23.4,
       "end": 23.56,
       "text": "to"
      },
      {
       "start": 23.57,
       "end": 23.8,
       "text": "paid"
      },
      {
       "start": 23.82,
       "end": 24.17,
       "text": "slipped"
      },
      {
       "start": 24.2,
       "end": 24.35,
       "text": "by"
      },
      {
       "start": 24.36,
       "end": 24.63,
       "text": "about"
      },
      {
       "start": 24.66,
       "end": 24.77,
       "text": "a"
      },
      {
       "start": 24.78,
       "end": 25.05,
       "text": "point"
      },
      {
       "start": 25.07,
       "end": 25.27,
       "text": "and"
      },
      {
       "start": 25.28,
       "end": 25.4,
       "text": "a"
      },
      {
       "start": 25.41,
       "end": 25.68,
       "text": "half."
      }
     ]
    },
    {
     "start": 26.1,
     "end": 27.2,
     "speaker": "SPEAKER_00",
     "text": "Do we know why?",
     "words": [
      {
       "start": 26.1,
       "end": 26.3,
       "text": "Do"
      },
      {
       "start": 26.32,
       "end": 26.52,
       "text": "we"
      },
      {
       "start": 26.54,
       "end": 26.84,
       "text": "know"
      },
      {
       "start": 26.87,
       "end": 27.17,
       "text": "why?"
      }
     ]
    },
    {
     "start": 27.6,
     "end": 31.0,
     "speaker": "SPEAKER_02",
     "text": "We think it is mostly the onboarding change we shipped in July.",
     "words": [
      {
       "start": 27.6,
       "end": 27.76,
       "text": "We"
      },
      {
       "start": 27.78,
       "end": 28.07,
       "text": "think"
      },
      {
       "start": 28.09,
       "end": 28.26,
       "text": "it"
      },
      {
       "start": 28.27,
       "end": 28.44,
       "text": "is"
      },
      {
       "start": 28.45,
       "end": 28.78,
       "text": "mostly"
      },
      {
       "start": 28.81,
       "end": 29.01,
       "text": "the"
      },
      {
       "start": 29.03,
       "end": 29.53,
       "text": "onboarding"
      },
      {
       "start": 29.57,
       "end": 29.9,
       "text": "change"
      },
      {
       "start": 29.93,
       "end": 30.09,
       "text": "we"
      },
      {
       "start": 30.11,
       "end": 30.48,
       "text": "shipped"
      },
      {
       "start": 30.51,
       "end": 30.67,
       "text": "in"
      },
      {
       "start": 30.69,
       "end": 30.97,
       "text": "July."
      }
     ]
    },
    {
     "start": 31.5,
     "end": 33.8,
     "speaker": "SPEAKER_00",
     "text": "Okay. Second, the mobile launch.",
     "words": [
      {
       "start": 31.5,
       "end": 31.89,
       "text": "Okay."
      },
      {
       "start": 31.92,
       "end": 32.42,
       "text": "Second,"
      },
      {
       "start": 32.47,
       "end": 32.75,
       "text": "the"
      },
      {
       "start": 32.77,
       "end": 33.22,
       "text": "mobile"
      },
      {
       "start": 33.26,
       "end": 33.76,
       "text": "launch."
      }
     ]
    },
    {
     "start": 34.2,
     "end": 38.6,
     "speaker": "SPEAKER_03",
     "text": "We are moving it from October to the first week of November.",
     "words": [
      {
       "start": 34.2,
       "end": 34.42,
       "text": "We"
      },
      {
       "start": 34.44,
       "end": 34.72,
       "text": "are"
      },
      {
       "start": 34.74,
       "end": 35.19,
       "text": "moving"
      },
      {
       "start": 35.22,
       "end": 35.45,
       "text": "it"
      },
      {
       "start": 35.47,
       "end": 35.8,
       "text": "from"
      },
      {
       "start": 35.83,
       "end": 36.33,
       "text": "October"
      },
      {
       "start": 36.37,
       "end": 36.59,
       "text": "to"
      },
      {
       "start": 36.61,
       "end": 36.89,
       "text": "the"
      },
      {
       "start": 36.91,
       "end": 37.3,
       "text": "first"
      },
      {
       "start": 37.33,
       "end": 37.67,
       "text": "week"
      },
      {
       "start": 37.7,
       "end": 37.92,
       "text": "of"
      },
      {
       "start": 37.94,
       "end": 38.55,
       "text": "November."
      }
     ]
    },
    {
     "start": 39.0,
     "end": 42.6,
     "speaker": "SPEAKER_03",
     "text": "The accessibility audit found 11 issues, four of them blocking.",
     "words": [
      {
       "start": 39.0,
       "end": 39.22,
       "text": "The"
      },
      {
       "start": 39.24,
       "end": 39.91,
       "text": "accessibility"
      },
      {
       "start": 39.97,
       "end": 40.29,
       "text": "audit"
      },
      {
       "start": 40.31,
       "end": 40.63,
       "text": "found"
      },
      {
       "start": 40.65,
       "end": 40.83,
       "text": "11"
      },
      {
       "start": 40.85,
       "end": 41.25,
       "text": "issues,"
      },
      {
       "start": 41.29,
       "end": 41.56,
       "text": "four"
      },
      {
       "start": 41.58,
       "end": 41.76,
       "text": "of"
      },
      {
       "start": 41.77,
       "end": 42.04,
       "text": "them"
      },
      {
       "start": 42.06,
       "end": 42.56,
       "text": "blocking."
      }
     ]
    },
    {
     "start": 43.0,
     "end": 47.2,
     "speaker": "SPEAKER_03",
     "text": "We will fix all four before launch, and the other seven go into the first update.",
     "words": [
      {
       "start": 43.0,
       "end": 43.16,
       "text": "We"
      },
      {
       "start": 43.17,
       "end": 43.41,
       "text": "will"
      },
      {
       "start": 43.43,
       "end": 43.63,
       "text": "fix"
      },
      {
       "start": 43.64,
       "end": 43.84,
       "text": "all"
      },
      {
       "start": 43.86,
       "end": 44.09,
       "text": "four"
      },
      {
       "start": 44.11,
       "end": 44.43,
       "text": "before"
      },
      {
       "start": 44.46,
       "end": 44.81,
       "text": "launch,"
      },
      {
       "start": 44.84,
       "end": 45.04,
       "text": "and"
      },
      {
       "start": 45.06,
       "end": 45.25,
       "text": "the"
      },
      {
       "start": 45.27,
       "end": 45.55,
       "text": "other"
      },
      {
       "start": 45.57,
       "end": 45.85,
       "text": "seven"
      },
      {
       "start": 45.87,
       "end": 46.03,
       "text": "go"
      },
      {
       "start": 46.04,
       "end": 46.28,
       "text": "into"
      },
      {
       "start": 46.3,
       "end": 46.5,
       "text": "the"
      },
      {
       "start": 46.51,
       "end": 46.79,
       "text": "first"
      },
      {
       "start": 46.81,
       "end": 47.17,
       "text": "update."
      }
     ]
    },
    {
     "start": 47.7,
     "end": 49.6,
     "speaker": "SPEAKER_01",
     "text": "Is November safe for the enterprise renewals?",
     "words": [
      {
       "start": 47.7,
       "end": 47.83,
       "text": "Is"
      },
      {
       "start": 47.84,
       "end": 48.17,
       "text": "November"
      },
      {
       "start": 48.2,
       "end": 48.4,
       "text": "safe"
      },
      {
       "start": 48.42,
       "end": 48.58,
       "text": "for"
      },
      {
       "start": 48.6,
       "end": 48.76,
       "text": "the"
      },
      {
       "start": 48.78,
       "end": 49.17,
       "text": "enterprise"
      },
      {
       "start": 49.21,
       "end": 49.57,
       "text": "renewals?"
      }
     ]
    },
    {
     "start": 50.0,
     "end": 53.9,
     "speaker": "SPEAKER_03",
     "text": "Yes. None of them depend on the mobile app until January.",
     "words": [
      {
       "start": 50.0,
       "end": 50.31,
       "text": "Yes."
      },
      {
       "start": 50.34,
       "end": 50.65,
       "text": "None"
      },
      {
       "start": 50.68,
       "end": 50.89,
       "text": "of"
      },
      {
       "start": 50.9,
       "end": 51.22,
       "text": "them"
      },
      {
       "start": 51.24,
       "end": 51.66,
       "text": "depend"
      },
      {
       "start": 51.7,
       "end": 51.9,
       "text": "on"
      },
      {
       "start": 51.92,
       "end": 52.18,
       "text": "the"
      },
      {
       "start": 52.2,
       "end": 52.62,
       "text": "mobile"
      },
      {
       "start": 52.66,
       "end": 52.92,
       "text": "app"
      },
      {
       "start": 52.94,
       "end": 53.3,
       "text": "until"
      },
      {
       "start": 53.33,
       "end": 53.85,
       "text": "January."
      }
     ]
    },
    {
     "start": 54.4,
     "end": 59.3,
     "speaker": "SPEAKER_00",
     "text": "Good. Third, hiring. We have two open roles on the platform team, and I want both filled this quarter.",
     "words": [
      {
       "start": 54.4,
       "end": 54.66,
       "text": "Good."
      },
      {
       "start": 54.68,
       "end": 54.98,
       "text": "Third,"
      },
      {
       "start": 55.0,
       "end": 55.34,
       "text": "hiring."
      },
      {
       "start": 55.36,
       "end": 55.51,
       "text": "We"
      },
      {
       "start": 55.52,
       "end": 55.75,
       "text": "have"
      },
      {
       "start": 55.77,
       "end": 55.95,
       "text": "two"
      },
      {
       "start": 55.97,
       "end": 56.19,
       "text": "open"
      },
      {
       "start": 56.21,
       "end": 56.47,
       "text": "roles"
      },
      {
       "start": 56.49,
       "end": 56.64,
       "text": "on"
      },
      {
       "start": 56.65,
       "end": 56.83,
       "text": "the"
      },
      {
       "start": 56.85,
       "end": 57.22,
       "text": "platform"
      },
      {
       "start": 57.25,
       "end": 57.51,
       "text": "team,"
      },
      {
       "start": 57.53,
       "end": 57.72,
       "text": "and"
      },
      {
       "start": 57.73,
       "end": 57.84,
       "text": "I"
      },
      {
       "start": 57.85,
       "end": 58.08,
       "text": "want"
      },
      {
       "start": 58.1,
       "end": 58.32,
       "text": "both"
      },
      {
       "start": 58.34,
       "end": 58.63,
       "text": "filled"
      },
      {
       "start": 58.66,
       "end": 58.88,
       "text": "this"
      },
      {
       "start": 58.9,
       "end": 59.27,
       "text": "quarter."
      }
     ]
    },
    {
     "start": 59.8,
     "end": 64.1,
     "speaker": "SPEAKER_02",
     "text": "Fourth, the pricing test. We ran the annual discount on half of new sign-ups for three weeks.",
     "words": [
      {
       "start": 59.8,
       "end": 60.12,
       "text": "Fourth,"
      },
      {
       "start": 60.15,
       "end": 60.33,
       "text": "the"
      },
      {
       "start": 60.34,
       "end": 60.66,
       "text": "pricing"
      },
      {
       "start": 60.69,
       "end": 60.94,
       "text": "test."
      },
      {
       "start": 60.96,
       "end": 61.1,
       "text": "We"
      },
      {
       "start": 61.12,
       "end": 61.3,
       "text": "ran"
      },
      {
       "start": 61.31,
       "end": 61.49,
       "text": "the"
      },
      {
       "start": 61.5,
       "end": 61.79,
       "text": "annual"
      },
      {
       "start": 61.81,
       "end": 62.17,
       "text": "discount"
      },
      {
       "start": 62.2,
       "end": 62.34,
       "text": "on"
      },
      {
       "start": 62.36,
       "end": 62.57,
       "text": "half"
      },
      {
       "start": 62.59,
       "end": 62.73,
       "text": "of"
      },
      {
       "start": 62.74,
       "end": 62.92,
       "text": "new"
      },
      {
       "start": 62.94,
       "end": 63.29,
       "text": "sign-ups"
      },
      {
       "start": 63.33,
       "end": 63.5,
       "text": "for"
      },
      {
       "start": 63.52,
       "end": 63.77,
       "text": "three"
      },
      {
       "start": 63.79,
       "end": 64.08,
       "text": "weeks."
      }
     ]
    },
    {
     "start": 64.5,
     "end": 69.6,
     "speaker": "SPEAKER_02",
     "text": "Annual plans went up by a third, and refunds did not move, so we would like to roll it out to everyone on Monday.",
     "words": [
      {
       "start": 64.5,
       "end": 64.77,
       "text": "Annual"
      },
      {
       "start": 64.8,
       "end": 65.03,
       "text": "plans"
      },
      {
       "start": 65.05,
       "end": 65.26,
       "text": "went"
      },
      {
       "start": 65.28,
       "end": 65.41,
       "text": "up"
      },
      {
       "start": 65.42,
       "end": 65.56,
       "text": "by"
      },
      {
       "start": 65.57,
       "end": 65.67,
       "text": "a"
      },
      {
       "start": 65.68,
       "end": 65.95,
       "text": "third,"
      },
      {
       "start": 65.98,
       "end": 66.15,
       "text": "and"
      },
      {
       "start": 66.16,
       "end": 66.47,
       "text": "refunds"
      },
      {
       "start": 66.5,
       "end": 66.67,
       "text": "did"
      },
      {
       "start": 66.68,
       "end": 66.85,
       "text": "not"
      },
      {
       "start": 66.87,
       "end": 67.1,
       "text": "move,"
      },
      {
       "start": 67.12,
       "end": 67.26,
       "text": "so"
      },
      {
       "start": 67.27,
       "end": 67.41,
       "text": "we"
      },
      {
       "start": 67.42,
       "end": 67.66,
       "text": "would"
      },
      {
       "start": 67.68,
       "end": 67.88,
       "text": "like"
      },
      {
       "start": 67.9,
       "end": 68.04,
       "text": "to"
      },
      {
       "start": 68.05,
       "end": 68.25,
       "text": "roll"
      },
      {
       "start": 68.27,
       "end": 68.41,
       "text": "it"
      },
      {
       "start": 68.42,
       "end": 68.59,
       "text": "out"
      },
      {
       "start": 68.6,
       "end": 68.74,
       "text": "to"
      },
      {
       "start": 68.75,
       "end": 69.09,
       "text": "everyone"
      },
      {
       "start": 69.12,
       "end": 69.26,
       "text": "on"
      },
      {
       "start": 69.27,
       "end": 69.57,
       "text": "Monday."
      }
     ]
    },
    {
     "start": 70.0,
     "end": 71.4,
     "speaker": "SPEAKER_01",
     "text": "No objection from finance.",
     "words": [
      {
       "start": 70.0,
       "end": 70.17,
       "text": "No"
      },
      {
       "start": 70.18,
       "end": 70.64,
       "text": "objection"
      },
      {
       "start": 70.68,
       "end": 70.93,
       "text": "from"
      },
      {
       "start": 70.95,
       "end": 71.36,
       "text": "finance."
      }
     ]
    },
    {
     "start": 71.9,
     "end": 74.4,
     "speaker": "SPEAKER_00",
     "text": "Then that is decided. Before we wrap up, the decisions.",
     "words": [
      {
       "start": 71.9,
       "end": 72.11,
       "text": "Then"
      },
      {
       "start": 72.13,
       "end": 72.34,
       "text": "that"
      },
      {
       "start": 72.35,
       "end": 72.49,
       "text": "is"
      },
      {
       "start": 72.51,
       "end": 72.85,
       "text": "decided."
      },
      {
       "start": 72.88,
       "end": 73.16,
       "text": "Before"
      },
      {
       "start": 73.19,
       "end": 73.33,
       "text": "we"
      },
      {
       "start": 73.34,
       "end": 73.55,
       "text": "wrap"
      },
      {
       "start": 73.57,
       "end": 73.74,
       "text": "up,"
      },
      {
       "start": 73.76,
       "end": 73.93,
       "text": "the"
      },
      {
       "start": 73.95,
       "end": 74.36,
       "text": "decisions."
      }
     ]
    },
    {
     "start": 74.8,
     "end": 84.6,
     "speaker": "SPEAKER_00",
     "text": "The mobile launch moves to the fourth of November, the annual discount ships on Monday, and the July onboarding change gets a proper review next week.",
     "words": [
      {
       "start": 74.8,
       "end": 75.05,
       "text": "The"
      },
      {
       "start": 75.08,
       "end": 75.48,
       "text": "mobile"
      },
      {
       "start": 75.52,
       "end": 75.93,
       "text": "launch"
      },
      {
       "start": 75.96,
       "end": 76.32,
       "text": "moves"
      },
      {
       "start": 76.35,
       "end": 76.55,
       "text": "to"
      },
      {
       "start": 76.57,
       "end": 76.83,
       "text": "the"
      },
      {
       "start": 76.85,
       "end": 77.26,
       "text": "fourth"
      },
      {
       "start": 77.29,
       "end": 77.5,
       "text": "of"
      },
      {
       "start": 77.51,
       "end": 78.07,
       "text": "November,"
      },
      {
       "start": 78.12,
       "end": 78.38,
       "text": "the"
      },
      {
       "start": 78.4,
       "end": 78.81,
       "text": "annual"
      },
      {
       "start": 78.84,
       "end": 79.35,
       "text": "discount"
      },
      {
       "start": 79.4,
       "end": 79.75,
       "text": "ships"
      },
      {
       "start": 79.78,
       "end": 79.99,
       "text": "on"
      },
      {
       "start": 80.0,
       "end": 80.46,
       "text": "Monday,"
      },
      {
       "start": 80.5,
       "end": 80.76,
       "text": "and"
      },
      {
       "start": 80.78,
       "end": 81.03,
       "text": "the"
      },
      {
       "start": 81.06,
       "end": 81.36,
       "text": "July"
      },
      {
       "start": 81.39,
       "end": 82.0,
       "text": "onboarding"
      },
      {
       "start": 82.05,
       "end": 82.46,
       "text": "change"
      },
      {
       "start": 82.5,
       "end": 82.8,
       "text": "gets"
      },
      {
       "start": 82.83,
       "end": 82.98,
       "text": "a"
      },
      {
       "start": 82.99,
       "end": 83.4,
       "text": "proper"
      },
      {
       "start": 83.44,
       "end": 83.84,
       "text": "review"
      },
      {
       "start": 83.88,
       "end": 84.19,
       "text": "next"
      },
      {
       "start": 84.21,
       "end": 84.57,
       "text": "week."
      }
     ]
    },
    {
     "start": 85.1,
     "end": 88.0,
     "speaker": "SPEAKER_03",
     "text": "I will bring the support numbers to that review.",
     "words": [
      {
       "start": 85.1,
       "end": 85.24,
       "text": "I"
      },
      {
       "start": 85.25,
       "end": 85.53,
       "text": "will"
      },
      {
       "start": 85.55,
       "end": 85.87,
       "text": "bring"
      },
      {
       "start": 85.9,
       "end": 86.13,
       "text": "the"
      },
      {
       "start": 86.15,
       "end": 86.56,
       "text": "support"
      },
      {
       "start": 86.6,
       "end": 87.01,
       "text": "numbers"
      },
      {
       "start": 87.05,
       "end": 87.23,
       "text": "to"
      },
      {
       "start": 87.25,
       "end": 87.53,
       "text": "that"
      },
      {
       "start": 87.55,
       "end": 87.96,
       "text": "review."
      }
     ]
    },
    {
     "start": 88.5,
     "end": 94.2,
     "speaker": "SPEAKER_00",
     "text": "Thanks. The action items are in the notes, and I will send the recording round after this.",
     "words": [
      {
       "start": 88.5,
       "end": 88.94,
       "text": "Thanks."
      },
      {
       "start": 88.97,
       "end": 89.22,
       "text": "The"
      },
      {
       "start": 89.24,
       "end": 89.63,
       "text": "action"
      },
      {
       "start": 89.66,
       "end": 90.0,
       "text": "items"
      },
      {
       "start": 90.03,
       "end": 90.27,
       "text": "are"
      },
      {
       "start": 90.29,
       "end": 90.49,
       "text": "in"
      },
      {
       "start": 90.51,
       "end": 90.75,
       "text": "the"
      },
      {
       "start": 90.77,
       "end": 91.16,
       "text": "notes,"
      },
      {
       "start": 91.19,
       "end": 91.43,
       "text": "and"
      },
      {
       "start": 91.46,
       "end": 91.6,
       "text": "I"
      },
      {
       "start": 91.61,
       "end": 91.91,
       "text": "will"
      },
      {
       "start": 91.93,
       "end": 92.22,
       "text": "send"
      },
      {
       "start": 92.25,
       "end": 92.49,
       "text": "the"
      },
      {
       "start": 92.51,
       "end": 93.05,
       "text": "recording"
      },
      {
       "start": 93.09,
       "end": 93.43,
       "text": "round"
      },
      {
       "start": 93.46,
       "end": 93.8,
       "text": "after"
      },
      {
       "start": 93.83,
       "end": 94.17,
       "text": "this."
      }
     ]
    }
   ]
  },
  "preview": {
   "text": "Thanks everyone for joining the quarterly planning review. I want to move quickly today because we have a lot to cover and several people have a hard stop at the top of the hour. First, the numbers. Revenue came in 11% above forecast. Most of that came from the enterprise segment, where three of the five deals we expected in the next quarter closed early. The self-serve business was flat. Trials were up, but conversion to paid slipped by about a point and a half. Do we know why? We think it is mostly the onboarding change we shipped in July.",
   "language": "en",
   "segments": [
    {
     "start": 0.0,
     "end": 3.1,
     "speaker": "SPEAKER_00",
     "text": "Thanks everyone for joining the quarterly planning review.",
     "words": [
      {
       "start": 0.0,
       "end": 0.34,
       "text": "Thanks"
      },
      {
       "start": 0.37,
       "end": 0.8,
       "text": "everyone"
      },
      {
       "start": 0.83,
       "end": 1.05,
       "text": "for"
      },
      {
       "start": 1.06,
       "end": 1.45,
       "text": "joining"
      },
      {
       "start": 1.48,
       "end": 1.69,
       "text": "the"
      },
      {
       "start": 1.71,
       "end": 2.18,
       "text": "quarterly"
      },
      {
       "start": 2.22,
       "end": 2.65,
       "text": "planning"
      },
      {
       "start": 2.68,
       "end": 3.07,
       "text": "review."
      }
     ]
    },
    {
     "start": 3.4,
     "end": 8.6,
     "speaker": "SPEAKER_00",
     "text": "I want to move quickly today because we have a lot to cover and several people have a hard stop at the top of the hour.",
     "words": [
      {
       "start": 3.4,
       "end": 3.5,
       "text": "I"
      },
      {
       "start": 3.51,
       "end": 3.7,
       "text": "want"
      },
      {
       "start": 3.72,
       "end": 3.85,
       "text": "to"
      },
      {
       "start": 3.86,
       "end": 4.06,
       "text": "move"
      },
      {
       "start": 4.08,
       "end": 4.37,
       "text": "quickly"
      },
      {
       "start": 4.4,
       "end": 4.63,
       "text": "today"
      },
      {
       "start": 4.65,
       "end": 4.94,
       "text": "because"
      },
      {
       "start": 4.97,
       "end": 5.1,
       "text": "we"
      },
      {
       "start": 5.11,
       "end": 5.31,
       "text": "have"
      },
      {
       "start": 5.32,
       "end": 5.42,
       "text": "a"
      },
      {
       "start": 5.43,
       "end": 5.59,
       "text": "lot"
      },
      {
       "start": 5.61,
       "end": 5.74,
       "text": "to"
      },
      {
       "start": 5.75,
       "end": 5.98,
       "text": "cover"
      },
      {
       "start": 6.0,
       "end": 6.16,
       "text": "and"
      },
      {
       "start": 6.18,
       "end": 6.47,
       "text": "several"
      },
      {
       "start": 6.5,
       "end": 6.76,
       "text": "people"
      },
      {
       "start": 6.78,
       "end": 6.98,
       "text": "have"
      },
      {
       "start": 7.0,
       "end": 7.1,
       "text": "a"
      },
      {
       "start": 7.1,
       "end": 7.3,
       "text": "hard"
      },
      {
       "start": 7.32,
       "end": 7.51,
       "text": "stop"
      },
      {
       "start": 7.53,
       "end": 7.66,
       "text": "at"
      },
      {
       "start": 7.67,
       "end": 7.84,
       "text": "the"
      },
      {
       "start": 7.85,
       "end": 8.02,
       "text": "top"
      },
      {
       "start": 8.03,
       "end": 8.16,
       "text": "of"
      },
      {
       "start": 8.17,
       "end": 8.34,
       "text": "the"
      },
      {
       "start": 8.35,
       "end": 8.58,
       "text": "hour."
      }
     ]
    },
    {
     "start": 9.0,
     "end": 10.1,
     "speaker": "SPEAKER_00",
     "text": "First, the numbers.",
     "words": [
      {
       "start": 9.0,
       "end": 9.35,
       "text": "First,"
      },
      {
       "start": 9.38,
       "end": 9.6,
       "text": "the"
      },
      {
       "start": 9.62,
       "end": 10.06,
       "text": "numbers."
      }
     ]
    },
    {
     "start": 10.6,
     "end": 12.8,
     "speaker": "SPEAKER_01",
     "text": "Revenue came in 11% above forecast.",
     "words": [
      {
       "start": 10.6,
       "end": 11.03,
       "text": "Revenue"
      },
      {
       "start": 11.07,
       "end": 11.36,
       "text": "came"
      },
      {
       "start": 11.39,
       "end": 11.58,
       "text": "in"
      },
      {
       "start": 11.6,
       "end": 11.84,
       "text": "11%"
      },
      {
       "start": 11.86,
       "end": 12.19,
       "text": "above"
      },
      {
       "start": 12.22,
       "end": 12.75,
       "text": "forecast."
      }
     ]
    },
    {
     "start": 13.1,
     "end": 19.4,
     "speaker": "SPEAKER_01",
     "text": "Most of that came from the enterprise segment, where three of the five deals we expected in the next quarter closed early.",
     "words": [
      {
       "start": 13.1,
       "end": 13.34,
       "text": "Most"
      },
      {
       "start": 13.36,
       "end": 13.52,
       "text": "of"
      },
      {
       "start": 13.53,
       "end": 13.77,
       "text": "that"
      },
      {
       "start": 13.8,
       "end": 14.04,
       "text": "came"
      },
      {
       "start": 14.06,
       "end": 14.3,
       "text": "from"
      },
      {
       "start": 14.32,
       "end": 14.52,
       "text": "the"
      },
      {
       "start": 14.53,
       "end": 15.01,
       "text": "enterprise"
      },
      {
       "start": 15.06,
       "end": 15.45,
       "text": "segment,"
      },
      {
       "start": 15.49,
       "end": 15.77,
       "text": "where"
      },
      {
       "start": 15.79,
       "end": 16.07,
       "text": "three"
      },
      {
       "start": 16.1,
       "end": 16.26,
       "text": "of"
      },
      {
       "start": 16.27,
       "end": 16.47,
       "text": "the"
      },
      {
       "start": 16.49,
       "end": 16.73,
       "text": "five"
      },
      {
       "start": 16.75,
       "end": 17.03,
       "text": "deals"
      },
      {
       "start": 17.05,
       "end": 17.21,
       "text": "we"
      },
      {
       "start": 17.23,
       "end": 17.63,
       "text": "expected"
      },
      {
       "start": 17.66,
       "end": 17.82,
       "text": "in"
      },
      {
       "start": 17.84,
       "end": 18.04,
       "text": "the"
      },
      {
       "start": 18.05,
       "end": 18.29,
       "text": "next"
      },
      {
       "start": 18.31,
       "end": 18.67,
       "text": "quarter"
      },
      {
       "start": 18.7,
       "end": 19.02,
       "text": "closed"
      },
      {
       "start": 19.05,
       "end": 19.37,
       "text": "early."
      }
     ]
    },
    {
     "start": 19.9,
     "end": 21.5,
     "speaker": "SPEAKER_02",
     "text": "The self-serve business was flat.",
     "words": [
      {
       "start": 19.9,
       "end": 20.09,
       "text": "The"
      },
      {
       "start": 20.11,
       "end": 20.56,
       "text": "self-serve"
      },
      {
       "start": 20.6,
       "end": 20.97,
       "text": "business"
      },
      {
       "start": 21.01,
       "end": 21.2,
       "text": "was"
      },
      {
       "start": 21.21,
       "end": 21.48,
       "text": "flat."
      }
     ]
    },
    {
     "start": 21.9,
     "end": 25.7,
     "speaker": "SPEAKER_02",
     "text": "Trials were up, but conversion to paid slipped by about a point and a half.",
     "words": [
      {
       "start": 21.9,
       "end": 22.21,
       "text": "Trials"
      },
      {
       "start": 22.23,
       "end": 22.46,
       "text": "were"
      },
      {
       "start": 22.48,
       "end": 22.68,
       "text": "up,"
      },
      {
       "start": 22.69,
       "end": 22.89,
       "text": "but"
      },
      {
       "start": 22.9,
       "end": 23.36,
       "text": "conversion"
      },
      {
       "start": 23.4,
       "end": 23.56,
       "text": "to"
      },
      {
       "start": 23.57,
       "end": 23.8,
       "text": "paid"
      },
      {
       "start": 23.82,
       "end": 24.17,
       "text": "slipped"
      },
      {
       "start": 24.2,
       "end": 24.35,
       "text": "by"
      },
      {
       "start": 24.36,
       "end": 24.63,
       "text": "about"
      },
      {
       "start": 24.66,
       "end": 24.77,
       "text": "a"
      },
      {
       "start": 24.78,
       "end": 25.05,
       "text": "point"
      },
      {
       "start": 25.07,
       "end": 25.27,
       "text": "and"
      },
      {
       "start": 25.28,
       "end": 25.4,
       "text": "a"
      },
      {
       "start": 25.41,
       "end": 25.68,
       "text": "half."
      }
     ]
    },
    {
     "start": 26.1,
     "end": 27.2,
     "speaker": "SPEAKER_00",
     "text": "Do we know why?",
     "words": [
      {
       "start": 26.1,
       "end": 26.3,
       "text": "Do"
      },
      {
       "start": 26.32,
       "end": 26.52,
       "text": "we"
      },
      {
       "start": 26.54,
       "end": 26.84,
       "text": "know"
      },
      {
       "start": 26.87,
       "end": 27.17,
       "text": "why?"
      }
     ]
    },
    {
     "start": 27.6,
     "end": 31.0,
     "speaker": "SPEAKER_02",
     "text": "We think it is mostly the onboarding change we shipped in July.",
     "words": [
      {
       "start": 27.6,
       "end": 27.76,
       "text": "We"
      },
      {
       "start": 27.78,
       "end": 28.07,
       "text": "think"
      },
      {
       "start": 28.09,
       "end": 28.26,
       "text": "it"
      },
      {
       "start": 28.27,
       "end": 28.44,
       "text": "is"
      },
      {
       "start": 28.45,
       "end": 28.78,
       "text": "mostly"
      },
      {
       "start": 28.81,
       "end": 29.01,
       "text": "the"
      },
      {
       "start": 29.03,
       "end": 29.53,
       "text": "onboarding"
      },
      {
       "start": 29.57,
       "end": 29.9,
       "text": "change"
      },
      {
       "start": 29.93,
       "end": 30.09,
       "text": "we"
      },
      {
       "start": 30.11,
       "end": 30.48,
       "text": "shipped"
      },
      {
       "start": 30.51,
       "end": 30.67,
       "text": "in"
      },
      {
       "start": 30.69,
       "end": 30.97,
       "text": "July."
      }
     ]
    }
   ]
  }
 },
 "me": {
  "guest": {
   "email": null,
   "tier": "guest",
   "retention_days": 3,
   "signed_in": false
  },
  "owner": {
   "email": "you@example.com",
   "tier": "free",
   "retention_days": 30,
   "signed_in": true
  },
  "other": {
   "email": "sam.other@example.com",
   "tier": "free",
   "retention_days": 30,
   "signed_in": true
  }
 },
 "audioExpired": {
  "error": "Audio retention window has elapsed.",
  "code": "AUDIO_EXPIRED",
  "retention_days": 3
 },
 "locked": {
  "locked": true,
  "locked_code": "transcript_locked",
  "unlock_url": "https://whipscribe.com/pricing"
 },
 "processing": {
  "status": "processing",
  "progress": 0.42
 },
 "queued": {
  "status": "queued",
  "progress": 0.0
 },
 "noSpeech": {
  "status": "done",
  "speech_detected": false,
  "speech_ratio": 0.02,
  "suggestion": "This file appears to be music or ambient audio. Transcription requires spoken content."
 },
 "failed": {
  "status": "failed",
  "error": "Upstream transcription service error."
 }
};
