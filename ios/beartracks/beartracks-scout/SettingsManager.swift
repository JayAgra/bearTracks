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
            "season": "2024",
            "darkMode": true,
        ]
        UserDefaults.standard.register(defaults: defaults)
    }
}
