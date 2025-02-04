//
//  SettingsManager.swift
//  beartracks-scout
//
//  Created by Jayen Agrawal on 1/14/24.
//

import Foundation

class SettingsManager {
    static let shared = SettingsManager()
    
    private init() {
        let defaults: [String: Any] = [
            "eventCode": "TEST",
            "season": "2025",
            "darkMode": true,
            "leftHand": false,
            "gameInterface2025": 0
        ]
        UserDefaults.standard.register(defaults: defaults)
    }
}
