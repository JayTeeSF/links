#!/usr/bin/env ruby

# frozen_string_literal: true

# Sample data
verses = 
[
  {"bible_ref" => "Philippians 4:6-7", "quote" => "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.", "bible_url" => "/bible/Philippians/4/"},
  {"bible_ref" => "Isaiah 41:10", "quote" => "So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.", "bible_url" => "/bible/Isaiah/41/10"},
  {"bible_ref" => "Matthew 11:28-30", "quote" => "Come to me, all you who are weary and burdened, and I will give you rest. Take my yoke upon you and learn from me, for I am gentle and humble in heart, and you will find rest for your souls. For my yoke is easy and my burden is light.", "bible_url" => "/bible/Matthew/11/"},
  {"bible_ref" => "Psalm 23:1-4", "quote" => "The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul. He guides me along the right paths for his name’s sake. Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.", "bible_url" => "/bible/Psalm/23/"},
  {"bible_ref" => "Jeremiah 29:11", "quote" => "For I know the plans I have for you,” declares the Lord, “plans to prosper you and not to harm you, plans to give you hope and a future.", "bible_url" => "/bible/Jeremiah/29/11"},
  {"bible_ref" => "Romans 8:28", "quote" => "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.", "bible_url" => "/bible/Romans/8/28"},
  {"bible_ref" => "Isaiah 40:31", "quote" => "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.", "bible_url" => "/bible/Isaiah/40/31"},
  {"bible_ref" => "Psalm 46:1", "quote" => "God is our refuge and strength, an ever-present help in trouble.", "bible_url" => "/bible/Psalm/46/1"},
  {"bible_ref" => "2 Corinthians 1:3-4", "quote" => "Praise be to the God and Father of our Lord Jesus Christ, the Father of compassion and the God of all comfort, who comforts us in all our troubles, so that we can comfort those in any trouble with the comfort we ourselves receive from God.", "bible_url" => "/bible/2Corinthians/1/"},
  {"bible_ref" => "Psalm 55:22", "quote" => "Cast your cares on the Lord and he will sustain you; he will never let the righteous be shaken.", "bible_url" => "/bible/Psalm/55/22"},
  {"bible_ref" => "1 Peter 5:7", "quote" => "Cast all your anxiety on him because he cares for you.", "bible_url" => "/bible/1Peter/5/7"},
  {"bible_ref" => "Joshua 1:9", "quote" => "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", "bible_url" => "/bible/Joshua/1/9"},
  {"bible_ref" => "Psalm 121:1-2", "quote" => "I lift up my eyes to the mountains— where does my help come from? My help comes from the Lord, the Maker of heaven and earth.", "bible_url" => "/bible/Psalm/121/"},
  {"bible_ref" => "Romans 15:13", "quote" => "May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit.", "bible_url" => "/bible/Romans/15/13"},
  {"bible_ref" => "Psalm 34:18", "quote" => "The Lord is close to the brokenhearted and saves those who are crushed in spirit.", "bible_url" => "/bible/Psalm/34/18"},
  {"bible_ref" => "Isaiah 26:3", "quote" => "You will keep in perfect peace those whose minds are steadfast, because they trust in you.", "bible_url" => "/bible/Isaiah/26/3"},
  {"bible_ref" => "Philippians 4:13", "quote" => "I can do all this through him who gives me strength.", "bible_url" => "/bible/Philippians/4/13"},
  {"bible_ref" => "2 Timothy 1:7", "quote" => "For God has not given us a spirit of fear, but of power and of love and of a sound mind.", "bible_url" => "/bible/2Timothy/1/7"},
  {"bible_ref" => "Psalm 32:7-8", "quote" => "You are my hiding place; you will protect me from trouble and surround me with songs of deliverance. I will instruct you and teach you in the way you should go; I will counsel you with my loving eye on you.", "bible_url" => "/bible/Psalm/32/"},
  {"bible_ref" => "John 14:27", "quote" => "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.", "bible_url" => "/bible/John/14/27"},
  {"bible_ref" => "Psalm 91:1-2", "quote" => "Whoever dwells in the shelter of the Most High will rest in the shadow of the Almighty. I will say of the Lord, “He is my refuge and my fortress, my God, in whom I trust.”", "bible_url" => "/bible/Psalm/91/"},
  {"bible_ref" => "Proverbs 3:5-6", "quote" => "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.", "bible_url" => "/bible/Proverbs/3/"},
  {"bible_ref" => "Lamentations 3:22-23", "quote" => "Because of the Lord’s great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.", "bible_url" => "/bible/Lamentations/3/"},
  {"bible_ref" => "Psalm 37:24", "quote" => "Though they stumble, they will never fall, for the Lord holds them by the hand.", "bible_url" => "/bible/Psalm/37/24"},
  {"bible_ref" => "Isaiah 43:2", "quote" => "When you pass through the waters, I will be with you; and when you pass through the rivers, they will not sweep over you. When you walk through the fire, you will not be burned; the flames will not set you ablaze.", "bible_url" => "/bible/Isaiah/43/2"},
  {"bible_ref" => "Psalm 147:3", "quote" => "He heals the brokenhearted and binds up their wounds.", "bible_url" => "/bible/Psalm/147/3"}
]

# Start of the HTML file content
html_content = <<-HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bible Verses</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
        }
        table {
            border-collapse: collapse;
            width: 80%;
            margin-top: 20px;
        }
        td, th {
            border: 1px solid #ddd;
            text-align: left;
            padding: 8px;
        }
        tr:nth-child(even) {
            background-color: #f2f2f2;
        }
        th {
            background-color: #4CAF50;
            color: white;
        }
    </style>
</head>
<body>
    <h1>Bible Verses</h1>
    <table>
        <tr>
            <th>Verse Reference</th>
            <th>Quote</th>
        </tr>
HTML

# Generate table rows for each entry
verses.each do |verse|
  html_content += "        <tr>\n"
  html_content += "          <td><a href=\"#{verse["bible_url"]}\">#{verse["bible_ref"]}</a></td>\n"
  html_content += "          <td>#{verse["quote"]}</td>\n"
  html_content += "        </tr>\n"
end

# End of the HTML file content
html_content += <<-HTML
    </table>
</body>
</html>
HTML

# Write the HTML content to a file
File.write('anchor_texts.html', html_content)

puts "HTML file 'anchor_texts.html' has been created successfully."
