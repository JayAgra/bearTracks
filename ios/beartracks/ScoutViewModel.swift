//
//  JustinViewModel.swift
//  beartracks
//
//  Created by Jayen Agrawal on 1/12/24.
//

import Foundation
import SwiftUI

class ScoutViewModel: ObservableObject {
    @Published private(set) var times: [Double] = [0.0, 0.0, 0.0]
    private var startMillis: [Double] = [0, 0, 0]
    private var buttonPressed: [Bool] = [false, false, false]
    
    func beginClick(buttonIndex: Int = 0) {
        if !buttonPressed[buttonIndex] {
            buttonPressed[buttonIndex].toggle()
            startMillis[buttonIndex] = Date().timeIntervalSince1970
            if UserDefaults.standard.bool(forKey: "haptics") {
                UINotificationFeedbackGenerator().notificationOccurred(.success)
            }
        }
    }
    
    func endClick(buttonIndex: Int = 0) {
        if buttonPressed[buttonIndex] {
            buttonPressed[buttonIndex].toggle()
            times[buttonIndex] += Date().timeIntervalSince1970 - startMillis[buttonIndex]
            startMillis[buttonIndex] = 0
            if UserDefaults.standard.bool(forKey: "haptics") {
                UINotificationFeedbackGenerator().notificationOccurred(.success)
            }
        }
    }
    
    func clearSpeaker() {
        times = [0, 0, 0]
        startMillis = [0, 0, 0]
        buttonPressed = [false, false, false]
        if UserDefaults.standard.bool(forKey: "haptics") {
            UIImpactFeedbackGenerator(style: .heavy).impactOccurred()
        }
    }
    
    func clearAmplifier() {
        times = [0, 0, 0]
        startMillis = [0, 0, 0]
        buttonPressed = [false, false, false]
        if UserDefaults.standard.bool(forKey: "haptics") {
            UIImpactFeedbackGenerator(style: .medium).impactOccurred()
        }
    }
}
