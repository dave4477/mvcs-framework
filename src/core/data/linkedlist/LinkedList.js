/**
 * Linked list data structure.
 */
class Node {
	constructor( data ) {
		this.data = data;
		this.next = null;
		this.prev = null;
	}
}

export default class LinkedList {
	constructor() {
		this.head = null;
		this.tail = null;	}

	append( item ) {
		let node = new Node( item );

		if(!this.head) {
			this.head = node;
			this.tail = node;
		} else {
			node.prev = this.tail;
			this.tail.next = node;
			this.tail = node
		}
	}

	appendAt( pos, item ) {
		let current = this.head;
		let counter = 1;
		let node = new Node( item );
		if( pos == 0 ) {
			this.head.prev = node
			node.next = this.head
			this.head = node
		} else {
			while(current) {
				current = current.next;
				if( counter == pos ) {
					node.prev = current.prev
					current.prev.next = node
					node.next = current
					current.prev = node
				}
				counter++
			}
		}
	}

	appendAfter( item ) {
		//
	}

	remove( item ) {
		let current = this.head;
		while( current ) {
			if( current.data === item ) {
				if( current == this.head && current == this.tail ) {
					this.head = null;
					this.tail = null;
				} else if ( current == this.head ) {
					this.head = this.head.next
					this.head.prev = null
				} else if ( current == this.tail ) {
					this.tail = this.tail.prev;
					this.tail.next = null;
				} else {
					current.prev.next = current.next;
					current.next.prev = current.prev;
				}
			}
			current = current.next
		}
	}

	removeAt( pos ) {
		let current = this.head;
		let counter = 1;
		if( pos == 0 ) {
			this.head = this.head.next;
			this.head.prev = null;
		} else {
			while( current ) {
				current = current.next
				if ( current == this.tail ) {
					this.tail = this.tail.prev;
					this.tail.next = null;
				} else if( counter == pos ) {
					current.prev.next = current.next;
					current.next.prev = current.prev;
					break;
				}
				counter++;
			}
		}
	}

	reverse(){
		let current = this.head;
		let prev = null;
		while( current ){
			let next = current.next
			current.next = prev
			current.prev = next
			prev = current
			current = next
		}
		this.tail = this.head
		this.head = prev
	}

	swap( nodeOne, nodeTwo ) {
		let current = this.head;
		let counter = 0;
		let firstNode;

		// Make sure we are okay to go
		if( nodeOne === nodeTwo ) {
			console.log(`ERROR: 'SWAP' both the nodes must be different!`);
			return false;
		} else if( nodeOne > nodeTwo ) {
			let temp = nodeOne;
			nodeOne = nodeTwo;
			nodeTwo = temp;
		}

		if( nodeOne < 0 || nodeTwo < 0 ) {
			console.log(`ERROR: 'SWAP' both the nodes must be index & index can not be negative!`);
			return false;
		}

		// Swap nodes
		while( current !== null ) {
			if( counter == nodeOne ){
				firstNode = current;
			} else if( counter == nodeTwo ) {
				let temp = current.data;
				current.data = firstNode.data;
				firstNode.data = temp;
			}
			current = current.next;
			counter++;
		}
		return true
	}

	length() {
		let current = this.head;
		let counter = 0;
		while( current !== null ) {
			counter++
			current = current.next
		}
		return counter;
	}

	display() {
		let current = this.head;
		let elements = [];
		while( current !== null ) {
			elements.push( current.data );
			current = current.next
		}
		return elements.join(" ");
	}

	isEmpty() {
		return this.length() < 1
	}

	traverse( fn ) {
		if(!fn || typeof fn !== 'function') {
			console.log(`ERROR: 'TRAVERSE' function is undefined!`);
			return false;
		}
		let current = this.head;
		while( current !== null ) {
			fn(current)
			current = current.next;
		}
		return true;
	}

	traverseReverse( fn ) {
		if(!fn || typeof fn !== 'function') {
			console.log(`ERROR: 'TRAVERSE_REVERSE' function is undefined!`);
			return false;
		}
		let current = this.tail;
		while( current !== null ) {
			fn(current)
			current = current.prev;
		}
		return true;
	}

	search( item ) {
		let current = this.head;
		let counter = 0;

		while( current ) {
			if( current.data == item ) {
				return counter
			}
			current = current.next
			counter++
		}
		return false;
	}

	getArray() {
		let current = this.head;
		let returnArr = [];

		while (current) {
			if (current.data) {
				returnArr.push(current.data);
			}
			current = current.next;
		}
		return returnArr;
	}
}