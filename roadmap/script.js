

async function generateRoadmap() {
const career = document.getElementById('careerInput').value;
if (!career) {
alert('Vui lòng nhập ngành nghề');
return;
}

document.getElementById('loading').style.display = 'block';

try {
const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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' // Thay thế bằng API key của bạn
    },
    body: JSON.stringify({
        model: "gpt-4o",
        messages: [{
            role: "user",
            content: `Do not hallucinate. Create a very detailed long and meets international standard learning roadmap for becoming a ${career}. 
        Format the response as a nested list with main topics and their subtopics.
        Include as many main topics and as many subtopics for each main topic as you want to fully become this career.
        Return ONLY the JSON with no markdown formatting or explanation. Also make sure to end with "Keep learning and research papers.." The response should start with { and end with } like this exact format:
        {
            "title": "${career} Roadmap",
            "nodes": [
                {
                    "id": "topic1",
                    "title": "Main Topic 1",
                    "children": [
                        {
                            "id": "sub1",
                            "title": "Subtopic 1.1"
                        },
                        {
                            "id": "sub2",
                            "title": "Subtopic 1.2"
                        }
                    ]
                },
                {
                    "id": "topic2",
                    "title": "Main Topic 2",
                    "children": [
                        {
                            "id": "sub1",
                            "title": "Subtopic 2.1"
                        },
                        {
                            "id": "sub2",
                            "title": "Subtopic 2.2"
                        }
                    ]
                }
            ]
        };`
        }]
    })
});

const result = await response.json();

// Parse the response content as JSON
const roadmapData = JSON.parse(result.choices[0].message.content);
console.log(roadmapData);

// Update the page title
document.querySelector('.title').textContent = roadmapData.title;

// Clear existing roadmap
const roadmapContainer = document.getElementById('roadmap');
roadmapContainer.innerHTML = '<svg class="connections" id="connections"></svg>';

// Initialize new roadmap with the generated data
new RoadmapViewer(roadmapData, 'roadmap');

// Hide dialog and loading
document.getElementById('loading').style.display = 'none';

} catch (error) {
console.error('Error:', error);
alert('Có lỗi xảy ra khi tạo roadmap. Vui lòng thử lại sau.');
document.getElementById('loading').style.display = 'none';
}
}

document.getElementById('careerInput').addEventListener('keypress', function(e) {
if (e.key === 'Enter') {
generateRoadmap();
}
});

class RoadmapViewer {
    constructor(data, containerId) {
        this.data = data;
        this.container = document.getElementById(containerId);
        this.connections = document.getElementById('connections');
        this.init();
    }

    createCurvedPath(start, end) {
        const controlPoint1X = start.x + (end.x - start.x) * 0.5;
        const controlPoint2X = end.x - (end.x - start.x) * 0.5;
        return `M ${start.x} ${start.y} C ${controlPoint1X} ${start.y}, ${controlPoint2X} ${end.y}, ${end.x} ${end.y}`;
    }

    renderSubtopics(topics, position, mainTopicId) {
if (!topics) return '';

const div = document.createElement('div');
div.className = position === 'left' ? 'subtopics-left' : 'subtopics-right';

// Tạo container cho các topic và thêm ID của topic chính
const topicsContainer = document.createElement('div');
topicsContainer.className = 'topics-container';
topicsContainer.id = `topic-${mainTopicId}`;

topics.forEach(topic => {
const topicDiv = document.createElement('div');
topicDiv.id = `topic-${topic.id}`;
topicDiv.className = 'topic-card subtopic-card';
topicDiv.textContent = topic.title;
topicsContainer.appendChild(topicDiv);
});

div.appendChild(topicsContainer);
return div;
}

    renderMainTopic(topic, index) {
const mainDiv = document.createElement('div');
mainDiv.className = 'main-topic';

const leftTopics = topic.children?.slice(0, Math.ceil((topic.children?.length || 0) / 2)) || [];
const rightTopics = topic.children?.slice(Math.ceil((topic.children?.length || 0) / 2)) || [];

// Add left subtopics
mainDiv.appendChild(this.renderSubtopics(leftTopics, 'left', topic.id));

// Add main topic
const mainTopic = document.createElement('div');
mainTopic.id = `main-${topic.id}`;
mainTopic.className = 'topic-card main-card';
mainTopic.textContent = topic.title;

// Add vertical connection if not last topic
if (index < this.data.nodes.length - 1) {
const connection = document.createElement('div');
connection.className = 'vertical-connection';
mainTopic.appendChild(connection);
}

mainDiv.appendChild(mainTopic);

// Add right subtopics
mainDiv.appendChild(this.renderSubtopics(rightTopics, 'right', topic.id));

return mainDiv;
}

    updateConnections() {
// Clear existing connections
this.connections.innerHTML = '';

this.data.nodes.forEach(topic => {
const mainNode = document.getElementById(`main-${topic.id}`);
if (!mainNode) return;

const mainRect = mainNode.getBoundingClientRect();
const containerRect = this.container.getBoundingClientRect();

// Tìm tất cả các topic con của topic chính này
const leftSubtopics = document.querySelectorAll(`.subtopics-left #topic-${topic.id} .topic-card`);
const rightSubtopics = document.querySelectorAll(`.subtopics-right #topic-${topic.id} .topic-card`);

// Xử lý các topic con bên trái
leftSubtopics.forEach(subtopicNode => {
    const subtopicRect = subtopicNode.getBoundingClientRect();
    
    const start = {
        x: subtopicRect.right - containerRect.left,
        y: subtopicRect.top + subtopicRect.height / 2 - containerRect.top
    };

    const end = {
        x: mainRect.left - containerRect.left,
        y: mainRect.top + mainRect.height / 2 - containerRect.top
    };

    this.drawConnection(start, end);
});

// Xử lý các topic con bên phải
rightSubtopics.forEach(subtopicNode => {
    const subtopicRect = subtopicNode.getBoundingClientRect();
    
    const start = {
        x: mainRect.right - containerRect.left,
        y: mainRect.top + mainRect.height / 2 - containerRect.top
    };

    const end = {
        x: subtopicRect.left - containerRect.left,
        y: subtopicRect.top + subtopicRect.height / 2 - containerRect.top
    };

    this.drawConnection(start, end);
});
});
}

drawConnection(start, end) {
const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
path.setAttribute("d", this.createCurvedPath(start, end));
path.setAttribute("fill", "none");
path.setAttribute("stroke", "#93C5FD");
path.setAttribute("stroke-width", "2");
path.setAttribute("stroke-dasharray", "5,5");

this.connections.appendChild(path);
}

    init() {
        // Render all topics
        this.data.nodes.forEach((topic, index) => {
            this.container.appendChild(this.renderMainTopic(topic, index));
        });

        // Initial connection update
        this.updateConnections();

        // Update connections on window resize
        window.addEventListener('resize', () => this.updateConnections());
    }
}

// Initialize the roadmap viewer
document.addEventListener('DOMContentLoaded', () => {
    new RoadmapViewer(data, 'roadmap');
});
