//
//  SettingsManager.swift
//  beartracks
//
//  Created by Jayen Agrawal on 1/9/24.
//

import Foundation

class SettingsManager {
    static let shared = SettingsManager()
    
    private init() {
        let defaults: [String: Any] = [
            "teamNumber": "766",
            "eventCode": "TEST",
            "season": "2025",
            "darkMode": true,
            "useAllCompData": false,
            "pickListSeason": 2025,
            "pickListComp": "",
            "pickList": "",
            "pickListStatus": ""
        ]
        UserDefaults().register(defaults: defaults)
    }
}
