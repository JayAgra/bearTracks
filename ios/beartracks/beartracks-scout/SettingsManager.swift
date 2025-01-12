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
            "eventCode": "CAFR",
            "season": "2025",
            "darkMode": true,
            "leftHand": false
        ]
        UserDefaults.standard.register(defaults: defaults)
    }
}
