# self repairing documents

Objective: to create a document editing flow that supports multiple users making small, predictable changes to a JSON schema.

We'll can skip Operational Transform if none of the operations need to be transformed :/

## Moving Pieces

Editor

Document

Communication

## Things That Are True

We can make clients responsible for transforming operations. 

Server must do final application of operation to document and forwarding of operations to all other clients.

Making changes to the document is not dependent on connecting to the server or being connected to the server.

Inserting and Removing properties on an Object may conflict if someone removes what I insert.

Inserting properties may conflict if someone inserts (updates) the same property I insert.

## Single User Editing

1. user clicks [Add Q]
2. redux document/insert ->  
4. CollaborationDocument -> 
5. CollaborationClient ->
6. ack CollaborationDocument -> 
7. redux -> page
 