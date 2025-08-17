// File Explorer Tree Traversal Application
class FileExplorerApp {
    constructor() {
        this.fileSystem = this.generateFileSystem();
        this.currentAlgorithm = 'recursive';
        this.isRunning = false;
        this.isPaused = false;
        this.currentStep = 0;
        this.executionSteps = [];
        this.speed = 800;
        this.visitedNodes = new Set();
        this.currentNode = null;
        this.stack = [];
        this.metrics = {
            startTime: 0,
            endTime: 0,
            totalSteps: 0,
            maxDepth: 0,
            maxStackSize: 0
        };
        
        this.initializeEventListeners();
        this.renderFileTree();
        this.updateUI();
    }

    // Generate a realistic file system structure
    generateFileSystem() {
        return {
            id: 'root',
            name: 'Project Root',
            type: 'folder',
            path: '/',
            children: [
                {
                    id: 'src',
                    name: 'src',
                    type: 'folder',
                    path: '/src',
                    children: [
                        {
                            id: 'components',
                            name: 'components',
                            type: 'folder',
                            path: '/src/components',
                            children: [
                                { id: 'header', name: 'Header.js', type: 'file', path: '/src/components/Header.js', size: '2.1 KB' },
                                { id: 'footer', name: 'Footer.js', type: 'file', path: '/src/components/Footer.js', size: '1.8 KB' },
                                { id: 'navbar', name: 'Navbar.js', type: 'file', path: '/src/components/Navbar.js', size: '3.2 KB' }
                            ]
                        },
                        {
                            id: 'utils',
                            name: 'utils',
                            type: 'folder',
                            path: '/src/utils',
                            children: [
                                { id: 'helpers', name: 'helpers.js', type: 'file', path: '/src/utils/helpers.js', size: '1.5 KB' },
                                { id: 'constants', name: 'constants.js', type: 'file', path: '/src/utils/constants.js', size: '0.8 KB' }
                            ]
                        },
                        { id: 'app', name: 'App.js', type: 'file', path: '/src/App.js', size: '4.2 KB' },
                        { id: 'index', name: 'index.js', type: 'file', path: '/src/index.js', size: '0.9 KB' }
                    ]
                },
                {
                    id: 'public',
                    name: 'public',
                    type: 'folder',
                    path: '/public',
                    children: [
                        { id: 'index-html', name: 'index.html', type: 'file', path: '/public/index.html', size: '1.2 KB' },
                        { id: 'favicon', name: 'favicon.ico', type: 'file', path: '/public/favicon.ico', size: '4.1 KB' },
                        {
                            id: 'assets',
                            name: 'assets',
                            type: 'folder',
                            path: '/public/assets',
                            children: [
                                { id: 'logo', name: 'logo.png', type: 'file', path: '/public/assets/logo.png', size: '12.3 KB' },
                                { id: 'bg', name: 'background.jpg', type: 'file', path: '/public/assets/background.jpg', size: '45.7 KB' }
                            ]
                        }
                    ]
                },
                {
                    id: 'docs',
                    name: 'docs',
                    type: 'folder',
                    path: '/docs',
                    children: [
                        { id: 'readme', name: 'README.md', type: 'file', path: '/docs/README.md', size: '3.4 KB' },
                        { id: 'api', name: 'API.md', type: 'file', path: '/docs/API.md', size: '8.9 KB' }
                    ]
                },
                { id: 'package', name: 'package.json', type: 'file', path: '/package.json', size: '2.1 KB' },
                { id: 'gitignore', name: '.gitignore', type: 'file', path: '/.gitignore', size: '0.3 KB' }
            ]
        };
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Algorithm selection
        document.querySelectorAll('.algorithm-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!this.isRunning) {
                    this.selectAlgorithm(e.target.dataset.algorithm);
                }
            });
        });

        // Control buttons
        document.getElementById('startBtn').addEventListener('click', () => this.startTraversal());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseTraversal());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetTraversal());

        // Speed control
        const speedSlider = document.getElementById('speedSlider');
        speedSlider.addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
            document.getElementById('speedValue').textContent = `${this.speed}ms`;
        });

        // Code tabs
        document.querySelectorAll('.code-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchCodeTab(e.target.dataset.tab);
            });
        });
    }

    // Select algorithm
    selectAlgorithm(algorithm) {
        this.currentAlgorithm = algorithm;
        
        // Update button states
        document.querySelectorAll('.algorithm-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.algorithm === algorithm);
        });
        
        // Update UI
        document.getElementById('currentAlgorithm').textContent = 
            algorithm === 'recursive' ? 'Recursive' : 'Iterative';
        
        this.resetTraversal();
    }

    // Start traversal
    async startTraversal() {
        if (this.isPaused) {
            this.isPaused = false;
            this.updateControlButtons();
            this.continueTraversal();
            return;
        }

        this.isRunning = true;
        this.isPaused = false;
        this.currentStep = 0;
        this.visitedNodes.clear();
        this.currentNode = null;
        this.stack = [];
        this.executionSteps = [];
        
        this.metrics.startTime = performance.now();
        this.metrics.totalSteps = 0;
        this.metrics.maxDepth = 0;
        this.metrics.maxStackSize = 0;

        this.updateControlButtons();
        this.updateStatusIndicator('running');
        this.clearLogs();

        // Generate execution steps
        if (this.currentAlgorithm === 'recursive') {
            await this.generateRecursiveSteps();
        } else {
            await this.generateIterativeSteps();
        }

        // Execute steps with animation
        await this.executeSteps();
    }

    // Generate recursive traversal steps
    async generateRecursiveSteps() {
        const steps = [];
        
        const traverse = (node, depth = 0) => {
            // Visit step
            steps.push({
                type: 'visit',
                node: node,
                depth: depth,
                action: `Visiting ${node.type}: ${node.name}`,
                stackSize: depth + 1
            });

            if (node.children && node.children.length > 0) {
                for (const child of node.children) {
                    // Recurse step
                    steps.push({
                        type: 'recurse',
                        node: child,
                        depth: depth + 1,
                        action: `Recursing into: ${child.name}`,
                        stackSize: depth + 2
                    });
                    
                    // Recursive call
                    traverse(child, depth + 1);
                    
                    // Return step
                    steps.push({
                        type: 'return',
                        node: child,
                        depth: depth + 1,
                        action: `Returning from: ${child.name}`,
                        stackSize: depth + 1
                    });
                }
            }

            // Complete step
            steps.push({
                type: 'complete',
                node: node,
                depth: depth,
                action: `Completed: ${node.name}`,
                stackSize: depth
            });
        };

        traverse(this.fileSystem);
        this.executionSteps = steps;
        this.metrics.totalSteps = steps.length;
        this.metrics.maxDepth = Math.max(...steps.map(s => s.depth));
        this.metrics.maxStackSize = Math.max(...steps.map(s => s.stackSize));
    }

    // Generate iterative traversal steps
    async generateIterativeSteps() {
        const steps = [];
        const stack = [{ node: this.fileSystem, depth: 0 }];
        let maxStackSize = 1;

        while (stack.length > 0) {
            maxStackSize = Math.max(maxStackSize, stack.length);
            const { node, depth } = stack.pop();

            // Visit step
            steps.push({
                type: 'visit',
                node: node,
                depth: depth,
                action: `Popped from stack: ${node.name}`,
                stackSize: stack.length + 1
            });

            if (node.children && node.children.length > 0) {
                // Push children in reverse order for correct traversal
                for (let i = node.children.length - 1; i >= 0; i--) {
                    const child = node.children[i];
                    stack.push({ node: child, depth: depth + 1 });
                    
                    steps.push({
                        type: 'push',
                        node: child,
                        depth: depth + 1,
                        action: `Pushed to stack: ${child.name}`,
                        stackSize: stack.length
                    });
                }
            }
        }

        this.executionSteps = steps;
        this.metrics.totalSteps = steps.length;
        this.metrics.maxDepth = Math.max(...steps.map(s => s.depth));
        this.metrics.maxStackSize = maxStackSize;
    }

    // Execute steps with animation
    async executeSteps() {
        for (let i = this.currentStep; i < this.executionSteps.length; i++) {
            if (!this.isRunning || this.isPaused) break;

            this.currentStep = i;
            const step = this.executionSteps[i];
            
            // Update current node and visited nodes
            this.currentNode = step.node;
            if (step.type === 'visit' || step.type === 'complete') {
                this.visitedNodes.add(step.node.id);
            }

            // Update stack visualization
            this.updateStackVisualization(step);
            
            // Update UI
            this.updateProgress();
            this.updateStepInfo(step);
            this.addLogEntry(step);
            this.renderFileTree();
            this.updateMetrics();

            // Wait for animation
            await this.sleep(this.speed);
        }

        if (this.isRunning && !this.isPaused) {
            this.completeTraversal();
        }
    }

    // Continue traversal after pause
    async continueTraversal() {
        this.updateStatusIndicator('running');
        await this.executeSteps();
    }

    // Pause traversal
    pauseTraversal() {
        this.isPaused = true;
        this.updateControlButtons();
        this.updateStatusIndicator('paused');
    }

    // Reset traversal
    resetTraversal() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentStep = 0;
        this.visitedNodes.clear();
        this.currentNode = null;
        this.stack = [];
        this.executionSteps = [];
        
        this.updateControlButtons();
        this.updateStatusIndicator('ready');
        this.updateProgress();
        this.clearLogs();
        this.clearStackVisualization();
        this.renderFileTree();
        this.resetMetrics();
    }

    // Complete traversal
    completeTraversal() {
        this.isRunning = false;
        this.metrics.endTime = performance.now();
        this.updateControlButtons();
        this.updateStatusIndicator('complete');
        this.updateMetrics();
        
        // Add completion log
        this.addLogEntry({
            type: 'complete',
            action: `Traversal completed in ${(this.metrics.endTime - this.metrics.startTime).toFixed(2)}ms`
        });
    }

    // Update control buttons state
    updateControlButtons() {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');

        if (this.isRunning && !this.isPaused) {
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            resetBtn.disabled = false;
        } else if (this.isPaused) {
            startBtn.disabled = false;
            startBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
            pauseBtn.disabled = true;
            resetBtn.disabled = false;
        } else {
            startBtn.disabled = false;
            startBtn.innerHTML = '<i class="fas fa-play"></i> Start Traversal';
            pauseBtn.disabled = true;
            resetBtn.disabled = false;
        }
    }

    // Update status indicator
    updateStatusIndicator(status) {
        const indicator = document.getElementById('statusIndicator');
        indicator.className = `status-indicator ${status}`;
        
        const statusText = {
            ready: 'Ready',
            running: 'Running',
            paused: 'Paused',
            complete: 'Complete'
        };
        
        indicator.textContent = statusText[status] || 'Ready';
    }

    // Update progress
    updateProgress() {
        const progress = this.executionSteps.length > 0 ? 
            ((this.currentStep + 1) / this.executionSteps.length) * 100 : 0;
        
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = 
            `${this.currentStep + 1} / ${this.executionSteps.length}`;
    }

    // Update step info
    updateStepInfo(step) {
        const stepInfo = document.getElementById('stepInfo');
        stepInfo.innerHTML = `
            <div><strong>Action:</strong> ${step.action}</div>
            <div><strong>Node:</strong> ${step.node.name}</div>
            <div><strong>Path:</strong> ${step.node.path}</div>
            <div><strong>Depth:</strong> ${step.depth}</div>
            <div><strong>Type:</strong> ${step.type}</div>
        `;
    }

    // Update stack visualization
    updateStackVisualization(step) {
        const container = document.getElementById('stackContainer');
        
        if (this.currentAlgorithm === 'recursive') {
            // Show call stack for recursive
            const stackItems = [];
            for (let i = 0; i <= step.depth; i++) {
                stackItems.push(`Call ${i + 1}: traverse(depth=${i})`);
            }
            
            container.innerHTML = stackItems.map(item => 
                `<div class="stack-item">${item}</div>`
            ).join('');
        } else {
            // Show explicit stack for iterative
            if (step.type === 'push') {
                this.stack.push(step.node.name);
            } else if (step.type === 'visit') {
                this.stack.pop();
            }
            
            if (this.stack.length === 0) {
                container.innerHTML = '<div class="empty-state">Stack is empty</div>';
            } else {
                container.innerHTML = this.stack.map((item, index) => 
                    `<div class="stack-item">Stack[${index}]: ${item}</div>`
                ).reverse().join('');
            }
        }
    }

    // Clear stack visualization
    clearStackVisualization() {
        document.getElementById('stackContainer').innerHTML = 
            '<div class="empty-state">No active calls</div>';
    }

    // Add log entry
    addLogEntry(step) {
        const logContainer = document.getElementById('logContainer');
        
        if (logContainer.querySelector('.empty-state')) {
            logContainer.innerHTML = '';
        }
        
        const entry = document.createElement('div');
        entry.className = `log-entry ${step.type}`;
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${step.action}`;
        
        logContainer.appendChild(entry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    // Clear logs
    clearLogs() {
        document.getElementById('logContainer').innerHTML = 
            '<div class="empty-state">Execution log will appear here</div>';
        document.getElementById('stepInfo').textContent = 
            'Select an algorithm and click Start to begin';
    }

    // Update metrics
    updateMetrics() {
        const executionTime = this.metrics.endTime > 0 ? 
            this.metrics.endTime - this.metrics.startTime : 
            performance.now() - this.metrics.startTime;
        
        document.getElementById('executionTime').textContent = `${executionTime.toFixed(2)}ms`;
        document.getElementById('totalSteps').textContent = this.metrics.totalSteps;
        document.getElementById('maxDepth').textContent = this.metrics.maxDepth;
        document.getElementById('memoryUsage').textContent = `${this.metrics.maxStackSize} calls`;
    }

    // Reset metrics
    resetMetrics() {
        document.getElementById('executionTime').textContent = '0ms';
        document.getElementById('totalSteps').textContent = '0';
        document.getElementById('maxDepth').textContent = '0';
        document.getElementById('memoryUsage').textContent = '0 calls';
    }

    // Render file tree
    renderFileTree() {
        const treeContainer = document.getElementById('fileTree');
        treeContainer.innerHTML = this.renderNode(this.fileSystem);
    }

    // Render individual node
    renderNode(node, depth = 0) {
        const isVisited = this.visitedNodes.has(node.id);
        const isCurrent = this.currentNode && this.currentNode.id === node.id;
        
        let nodeClass = 'tree-node';
        if (isCurrent) nodeClass += ' current';
        else if (isVisited) nodeClass += ' visited';
        
        const icon = node.type === 'folder' ? 'fas fa-folder' : 'fas fa-file';
        const iconClass = node.type === 'folder' ? 'folder' : 'file';
        
        let html = `
            <div class="${nodeClass}" style="margin-left: ${depth * 20}px">
                <div class="tree-node-content">
                    <i class="${icon} tree-node-icon ${iconClass}"></i>
                    <span class="tree-node-name">${node.name}</span>
                    ${node.size ? `<span class="tree-node-info">${node.size}</span>` : ''}
                </div>
            </div>
        `;
        
        if (node.children && node.children.length > 0) {
            html += '<div class="tree-children">';
            for (const child of node.children) {
                html += this.renderNode(child, depth + 1);
            }
            html += '</div>';
        }
        
        return html;
    }

    // Switch code tab
    switchCodeTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.code-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });
        
        // Update code blocks
        document.querySelectorAll('.code-block').forEach(block => {
            block.classList.toggle('active', block.id === `${tab}Code`);
        });
        
        // Update explanations
        document.querySelectorAll('.explanation').forEach(exp => {
            exp.classList.toggle('active', exp.id === `${tab}Explanation`);
        });
    }

    // Update UI
    updateUI() {
        this.updateControlButtons();
        this.updateStatusIndicator('ready');
        this.updateProgress();
        this.resetMetrics();
    }

    // Sleep utility
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FileExplorerApp();
});

// Add syntax highlighting for code blocks (simple version)
document.addEventListener('DOMContentLoaded', () => {
    const codeBlocks = document.querySelectorAll('code.javascript');
    codeBlocks.forEach(block => {
        let html = block.innerHTML;
        
        // Simple syntax highlighting
        html = html.replace(/\b(function|const|let|var|if|else|for|while|return|class|new)\b/g, '<span style="color: #ff79c6;">$1</span>');
        html = html.replace(/\b(true|false|null|undefined)\b/g, '<span style="color: #bd93f9;">$1</span>');
        html = html.replace(/(\/\/.*$)/gm, '<span style="color: #6272a4;">$1</span>');
        html = html.replace(/('.*?'|".*?")/g, '<span style="color: #f1fa8c;">$1</span>');
        html = html.replace(/\b(\d+)\b/g, '<span style="color: #bd93f9;">$1</span>');
        
        block.innerHTML = html;
    });
});