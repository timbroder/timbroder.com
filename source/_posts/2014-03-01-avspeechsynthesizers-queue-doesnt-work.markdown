---
author: tim
comments: true
date: 2014-03-01 20:46:39+00:00
layout: post
slug: avspeechsynthesizers-queue-doesnt-work
title: AVSpeechSynthesizer's queue doesn't work
wordpress_id: 1434
categories:
- Code
tags:
- AVSpeechSynthesizer
- CoreData
- ios
- Siri
---

Sort of. It acts as a queue, but subsequent items have problems.

Taken from the [documentation](https://developer.apple.com/library/ios/documentation/AVFoundation/Reference/AVSpeechSynthesizer_Ref/Reference/Reference.html#//apple_ref/occ/instm/AVSpeechSynthesizer/speakUtterance:) of - (void)speakUtterance:(AVSpeechUtterance *)_utterance_


<blockquote>Calling this method adds the utterance to a **queue; utterances are spoken in the order in which they are added to the queue**. If the synthesizer is not currently speaking, the utterance is spoken immediately.</blockquote>


This is true. You can queue up as many AVSpeechUtterance objects as you want, and they will be spoken, in order.  The problem is if you try to act on the Synthesizer after the first Utterance has been spoken. Specifically, I'm having an issue with pausing. But, stopping has an issue as well. If I try to pause during the first utterance using pauseSpeakingAtBoundary:AVSpeechBoundaryImmediate, I get the expected behavior. The speech stops and I can start it again with continueSpeaking.  (Even on the first Utterance, AVSpeechBoundaryWord, is giving me issues so I'm putting that aside for now).

However, if I try to pause on any of the subsequent Utterances, nothing happens.  The pausedSpeaking call is ignored.  (The synthesizer isn't nil, I checked).

So, why am I queuing up a lot of text? I plan on having AVSpeechSynthesizer speak a lot of text. This text is stored in CoreData.  Let's say my main object is called Read. Instead of storing all of the text for that object in Read.text I've split out the text into slices, stored in a separate Text entity. A Read object can have many of these.  This gives me control over how much text I load into memory at once.  My original plan was to load each slice into an Utterance.  When the speaking was done for that Utternace, queue up the next one (it should start immediatly or close to it). Fragments of this below:

[c]
    self.speechSynthesizer = [AVSpeechSynthesizer new];
    self.speechSynthesizer.delegate = self;

- (BOOL)addWordsToQueue:(NSString *)words
{
    if ( !words ) {
        return NO;
    }

    AVSpeechUtterance *utterance = [AVSpeechUtterance speechUtteranceWithString:words];
    utterance.rate = AVSpeechUtteranceMinimumSpeechRate;
    [self.speechSynthesizer speakUtterance:utterance];

    return YES;
}

//used in view
- (void)play
{
    [self.speechSynthesizer continueSpeaking];
}

- (void)pause
{
    [self.speechSynthesizer pauseSpeakingAtBoundary:AVSpeechBoundaryImmediate];
}

- (BOOL)isPaused
{
    return self.speechSynthesizer.isPaused;
}

#pragma mark - AVSpeechSynthesizerDelegate

- (void)speechSynthesizer:(AVSpeechSynthesizer *)synthesizer didFinishSpeechUtterance:(AVSpeechUtterance *)utterance
{
    NSString *words = [read getAndIncrementCurrentWordsAsString];

    if ( words != nil ) {
        [self addWordsToQueue:words];
    }
}
[/c]

Again, the first Utterance works fine, the rest don't. I've also experimented with queueing multiple slices at once, as well as checking if the synthesizer I get in didFinishSpeechUtterance is the correct instance.

I'm [not](http://stackoverflow.com/questions/19672814/an-issue-with-avspeechsynthesizer-any-workarounds) the first person to run into this issue. There are also a number of [radars](http://openradar.appspot.com/search?query=AVSpeechSynthesizer+). I've added one as well.

There is a workaround, but it's dirty and shouldn't be needed. In didFinishSpeechUtterance I recreate my AVSpeechSynthesizer so I'm always dealing with the first item in the queue. I really don't like it.  This is still broken in 7.1 beta 5. Hopefully it gets fixed. I'd like to implement this properly.

[c]
- (void) resetSynth
{
    self.speechSynthesizer = [AVSpeechSynthesizer new];
    self.speechSynthesizer.delegate = self;
}

#pragma mark - AVSpeechSynthesizerDelegate

- (void)speechSynthesizer:(AVSpeechSynthesizer *)synthesizer didFinishSpeechUtterance:(AVSpeechUtterance *)utterance
{
    [self resetSynth];
    NSString *words = [read getAndIncrementCurrentWordsAsString];

    if ( words != nil ) {
        [self addWordsToQueue:words];
    }
}
[/c]

This unfortunately still happens in the 7.1 beta
