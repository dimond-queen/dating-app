<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserMatch;
use App\Models\Message;
use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get users for creating matches and messages
        $john = User::where('email', 'john@example.com')->first();
        $jane = User::where('email', 'jane@example.com')->first();
        $mike = User::where('email', 'mike@example.com')->first();
        $sarah = User::where('email', 'sarah@example.com')->first();
        $alex = User::where('email', 'alex@example.com')->first();

        if (!$john || !$jane || !$mike || !$sarah || !$alex) {
            $this->command->warn('Some users not found. Make sure to run UsersTableSeeder first.');
            return;
        }

        // Create matches
        UserMatch::updateOrCreate([
            'user_id' => $john->id,
            'target_user_id' => $jane->id,
        ], [
            'action' => 'like',
            'is_match' => true,
        ]);

        UserMatch::updateOrCreate([
            'user_id' => $jane->id,
            'target_user_id' => $john->id,
        ], [
            'action' => 'like',
            'is_match' => true,
        ]);

        UserMatch::updateOrCreate([
            'user_id' => $john->id,
            'target_user_id' => $sarah->id,
        ], [
            'action' => 'like',
            'is_match' => true,
        ]);

        UserMatch::updateOrCreate([
            'user_id' => $sarah->id,
            'target_user_id' => $john->id,
        ], [
            'action' => 'like',
            'is_match' => true,
        ]);

        UserMatch::updateOrCreate([
            'user_id' => $mike->id,
            'target_user_id' => $jane->id,
        ], [
            'action' => 'like',
            'is_match' => true,
        ]);

        UserMatch::updateOrCreate([
            'user_id' => $jane->id,
            'target_user_id' => $mike->id,
        ], [
            'action' => 'like',
            'is_match' => true,
        ]);

        // Helper function to generate chat_id
        $generateChatId = function($userId1, $userId2) {
            return $userId1 < $userId2 ? "{$userId1}_{$userId2}" : "{$userId2}_{$userId1}";
        };

        // Create demo messages
        $messages = [
            // Conversation between John and Jane
            [
                'chat_id' => $generateChatId($john->id, $jane->id),
                'sender_id' => $john->id,
                'recipient_id' => $jane->id,
                'message' => 'Hi Jane! I saw your profile and loved your interests in reading and movies. What\'s your favorite book?',
                'is_read' => true,
            ],
            [
                'chat_id' => $generateChatId($john->id, $jane->id),
                'sender_id' => $jane->id,
                'recipient_id' => $john->id,
                'message' => 'Hi John! Thanks for reaching out. I\'m currently reading "The Seven Husbands of Evelyn Hugo" - it\'s amazing! What about you?',
                'is_read' => true,
            ],
            [
                'chat_id' => $generateChatId($john->id, $jane->id),
                'sender_id' => $john->id,
                'recipient_id' => $jane->id,
                'message' => 'That\'s a great choice! I just finished "Atomic Habits" - really changed my perspective on building good habits.',
                'is_read' => true,
            ],
            [
                'chat_id' => $generateChatId($john->id, $jane->id),
                'sender_id' => $jane->id,
                'recipient_id' => $john->id,
                'message' => 'Oh I\'ve heard great things about that book! Maybe we could discuss it over coffee sometime? ☕',
                'is_read' => true,
            ],
            [
                'chat_id' => $generateChatId($john->id, $jane->id),
                'sender_id' => $john->id,
                'recipient_id' => $jane->id,
                'message' => 'I\'d love that! How about this weekend? I know a great coffee shop downtown.',
                'is_read' => false,
            ],

            // Conversation between John and Sarah
            [
                'chat_id' => $generateChatId($john->id, $sarah->id),
                'sender_id' => $sarah->id,
                'recipient_id' => $john->id,
                'message' => 'Hey John! I noticed you love hiking. I just got back from a amazing trail in the mountains!',
                'is_read' => true,
            ],
            [
                'chat_id' => $generateChatId($john->id, $sarah->id),
                'sender_id' => $john->id,
                'recipient_id' => $sarah->id,
                'message' => 'That sounds incredible! Which trail did you do? I\'m always looking for new hiking spots.',
                'is_read' => true,
            ],
            [
                'chat_id' => $generateChatId($john->id, $sarah->id),
                'sender_id' => $sarah->id,
                'recipient_id' => $john->id,
                'message' => 'It was the Eagle Peak trail - about 8 miles round trip with stunning views at the top! Perfect for sunrise yoga too 🧘‍♀️',
                'is_read' => false,
            ],

            // Conversation between Mike and Jane
            [
                'chat_id' => $generateChatId($mike->id, $jane->id),
                'sender_id' => $mike->id,
                'recipient_id' => $jane->id,
                'message' => 'Hi Jane! Fellow movie lover here. What\'s the last great film you watched?',
                'is_read' => true,
            ],
            [
                'chat_id' => $generateChatId($mike->id, $jane->id),
                'sender_id' => $jane->id,
                'recipient_id' => $mike->id,
                'message' => 'Hey Mike! I just watched "Everything Everywhere All at Once" and it blew my mind! Have you seen it?',
                'is_read' => true,
            ],
            [
                'chat_id' => $generateChatId($mike->id, $jane->id),
                'sender_id' => $mike->id,
                'recipient_id' => $jane->id,
                'message' => 'Yes! That movie is absolutely incredible. The creativity and emotional depth... Michelle Yeoh was phenomenal!',
                'is_read' => false,
            ],
        ];

        foreach ($messages as $messageData) {
            Message::create($messageData);
        }

        $this->command->info('Demo matches and messages created successfully!');
    }
}